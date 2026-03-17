Write-Output "--- .NET Proxy Resolution ---"
[System.Net.WebRequest]::DefaultWebProxy.GetProxy("https://github.com") | Out-String | Write-Output

Write-Output "--- Invoke-WebRequest Test ---"
try {
    $res = Invoke-WebRequest -Uri https://github.com -UseBasicParsing -MaximumRedirection 0 -ErrorAction Stop
    "Connection Succeeded. Status Code: " + $res.StatusCode
} catch {
    "Connection Failed: " + $_.Exception.Message
}
