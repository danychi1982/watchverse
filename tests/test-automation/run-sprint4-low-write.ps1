param([switch]$Headless)
$ErrorActionPreference = 'Stop'
$automationRoot = $PSScriptRoot
$runId = Get-Date -Format 'yyyyMMdd_HHmmss'
$runDir = Join-Path $automationRoot "test-execution\$runId"
$screenshotDir = Join-Path $runDir 'screenshots'
$logDir = Join-Path $runDir 'logs'
$otherDir = Join-Path $runDir 'altro'
New-Item -ItemType Directory -Force -Path $screenshotDir,$logDir,$otherDir | Out-Null
$localServer = $null
try { [void](Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8765/index.html' -TimeoutSec 2) } catch {
  $serverPsi=[Diagnostics.ProcessStartInfo]::new(); $serverPsi.FileName=(Get-Command node).Source
  $serverPsi.Arguments="`"$(Join-Path $automationRoot 'static-server.js')`" 8765"; $serverPsi.WorkingDirectory=(Split-Path -Parent (Split-Path -Parent $automationRoot)); $serverPsi.UseShellExecute=$false; $serverPsi.CreateNoWindow=$true
  $localServer=[Diagnostics.Process]::new(); $localServer.StartInfo=$serverPsi; [void]$localServer.Start()
  for($attempt=0;$attempt -lt 40;$attempt++){try{[void](Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8765/index.html' -TimeoutSec 2);break}catch{Start-Sleep -Milliseconds 250}}
}
$preflight = & (Join-Path $automationRoot 'prepare-glassinspector-user.ps1')
$psi=[Diagnostics.ProcessStartInfo]::new(); $psi.FileName='C:\-- Personale\glass-inspector\mcp\GlassInspector.MCP.exe'; $psi.Arguments="--workspace-root `"$automationRoot`" --unsafe --log-level Error"; $psi.UseShellExecute=$false; $psi.RedirectStandardInput=$true; $psi.RedirectStandardOutput=$true; $psi.RedirectStandardError=$true
$server=[Diagnostics.Process]::new(); $server.StartInfo=$psi; [void]$server.Start(); $script:requestId=10
$rows=[Collections.Generic.List[object]]::new()
function Invoke-Gi($name,$arguments){$id=$script:requestId;$script:requestId++;$request=@{jsonrpc='2.0';id=$id;method='tools/call';params=@{name=$name;arguments=$arguments}}|ConvertTo-Json -Depth 14 -Compress;$server.StandardInput.WriteLine($request);$server.StandardInput.Flush();$raw=$server.StandardOutput.ReadLine();Set-Content (Join-Path $logDir "gi-response-$id.json") $raw -Encoding utf8;$response=$raw|ConvertFrom-Json;if($response.error -or $response.result.isError){throw "GlassInspector $name failed"};$payload=(($response.result.content|Where-Object type -eq 'text').text|ConvertFrom-Json);if($payload.error){throw "GlassInspector $name failed: $($payload.error) - $($payload.message)"};$payload}
function Add-Row($issue,$test,$step,$expected,$actual,$status){$rows.Add([pscustomobject]@{issue=$issue;test=$test;step=$step;expected=$expected;actual=$actual;status=$status})}
function Save-Shot($session,$name){$shot=Invoke-Gi 'web_screenshot' @{session=$session};$data=if($shot.base64){$shot.base64}else{$shot.data};if($data){[IO.File]::WriteAllBytes((Join-Path $screenshotDir "$name.png"),[Convert]::FromBase64String($data))}}
$cases=@(
  @{feature='pwa';id='TC-S4-PWA';issues=@('WVERSE-41','WVERSE-166','WVERSE-167','WVERSE-170');expected='Manifest, service worker, responsive, accessibility and lazy loading'},
  @{feature='library';id='TC-S4-LIBRARY';issues=@('WVERSE-199','WVERSE-200');expected='Series card, episode feedback, empty state and local library persistence'},
  @{feature='metadata';id='TC-S4-METADATA';issues=@('WVERSE-24','WVERSE-30','WVERSE-31','WVERSE-32','WVERSE-33','WVERSE-201','WVERSE-207','WVERSE-208','WVERSE-209','WVERSE-211','WVERSE-212','WVERSE-216','WVERSE-218','WVERSE-233','WVERSE-252','WVERSE-253','WVERSE-254');expected='Metadata cycle, diagnostics, sources, duration, navigation, retry scheduling, partial coverage and UI'}
)
try {
  $server.StandardInput.WriteLine('{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"watchverse-sprint4-low-write","version":"1"}}}');$server.StandardInput.Flush();[void]$server.StandardOutput.ReadLine()
  $validation=Invoke-Gi 'gi_yaml_validate' @{projectPath=(Join-Path $automationRoot 'test-plan')};$validationStatus=if($validation.valid -eq $true){'PASS'}else{'FAIL'}
  Add-Row 'WVERSE-238' 'S4-PREFLIGHT' 'Validate workflow YAML' 'Workflow YAML valid' "gi_yaml_validate: $validationStatus" $validationStatus
  Add-Row 'WVERSE-246' 'S4-PREFLIGHT' 'GlassInspector preflight' 'MCP available and files unlocked' "MCP $($preflight.Version); unlocked: $($preflight.UnblockedFiles)" 'PASS'
  $base='http://127.0.0.1:8765/tests/test-automation/test-data/sprint4-functional-harness.html'
  foreach($case in $cases){foreach($caseName in @('sunny','negative')){
    $test="$($case.id)-$caseName";$session=$null
    try {
      $attach=Invoke-Gi 'web_attach' @{engine='playwright';headless=[bool]$Headless;url="${base}?feature=$($case.feature)&case=$caseName"};$session=$attach.session
      [void](Invoke-Gi 'web_ready' @{session=$session;wait=$true;timeoutSeconds=30})
      if(-not $Headless){[void](Invoke-Gi 'unsafe_keyboard' @{action='hotkey';value='win+up'});[void](Invoke-Gi 'unsafe_keyboard' @{action='hotkey';value='ctrl+0'})}
      $deadline=[DateTime]::UtcNow.AddSeconds(90);$result=$null
      do{$result=Invoke-Gi 'web_query' @{session=$session;selector='#result[data-status="PASS"], #result[data-status="FAIL"]'};if($result.count -gt 0){break};Start-Sleep -Milliseconds 350}while([DateTime]::UtcNow -lt $deadline)
      $details=Invoke-Gi 'web_query' @{session=$session;selector='#details'};$actual=if($details.count -gt 0){$details.elements[0].text}else{'No details'}
      $pass=$result.count -gt 0 -and $result.elements[0].attributes.'data-status' -eq 'PASS';$status=if($pass){'PASS'}else{'FAIL'}
      Add-Row $test $test 'Functional case' "Case $caseName completed: $($case.expected)" $actual $status
      foreach($issue in $case.issues){Add-Row $issue $test "Coverage $caseName" "Issue covered by $caseName case" $actual $status};Save-Shot $session $test
    } catch {Add-Row $test $test 'Technical execution' 'Case completed without technical error' $_.Exception.Message 'FAIL';foreach($issue in $case.issues){Add-Row $issue $test "Coverage $caseName" "Issue covered by $caseName case" $_.Exception.Message 'FAIL'};try{if($session){Save-Shot $session $test}}catch{}}
    finally {if($session -and -not $Headless){try{[void](Invoke-Gi 'unsafe_keyboard' @{action='hotkey';value='alt+f4'})}catch{}}}
  }}
} finally {
  $rows|ConvertTo-Json -Depth 10|Set-Content (Join-Path $otherDir 'results.json') -Encoding utf8
  $summary=$rows|Group-Object issue|ForEach-Object{$statuses=$_.Group.status;[pscustomobject]@{issue=$_.Name;status=if($statuses -contains 'FAIL'){'FAIL'}else{'PASS'};tests=($_.Group.test|Sort-Object -Unique)-join ', ';evidence=($_.Group.actual|Select-Object -First 1)}}
  $summary|ConvertTo-Json -Depth 8|Set-Content (Join-Path $otherDir 'issue-summary.json') -Encoding utf8
  $body=($rows|ForEach-Object{"<tr><td>$($_.issue)</td><td>$($_.test)</td><td>$($_.step)</td><td>$($_.expected)</td><td>$($_.actual)</td><td class='$($_.status)'>$($_.status)</td></tr>"})-join "`n";$mode=if($Headless){'hidden'}else{'visible'}
  $html='<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Watchverse Sprint 4 '+$runId+'</title><style>body{font:14px Segoe UI,Arial;margin:24px;background:#111;color:#eee}table{border-collapse:collapse;width:100%}th,td{border:1px solid #444;padding:8px;vertical-align:top}th{background:#222}.PASS{color:#70e090}.FAIL{color:#ff8080}</style></head><body><h1>Watchverse Sprint 4 - low-write E2E</h1><p>Execution: '+$runId+' | Mode: '+$mode+'</p><p>Scope: local PWA, library and metadata harness; no real Supabase writes.</p><table><thead><tr><th>Issue</th><th>Test</th><th>Step</th><th>Expected</th><th>Obtained</th><th>Status</th></tr></thead><tbody>'+$body+'</tbody></table></body></html>'
  Set-Content (Join-Path $runDir 'report-completo.html') $html -Encoding utf8
  if(-not $server.HasExited){$server.Kill();$server.WaitForExit()};if($localServer -and -not $localServer.HasExited){$localServer.Kill();$localServer.WaitForExit()}
}
Write-Output $runDir
