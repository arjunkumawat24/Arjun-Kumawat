$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:3000/")
$listener.Start()
Write-Host "Server is running at http://localhost:3000/"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $response = $context.Response
        
        try {
            $localPath = $context.Request.Url.LocalPath
            if ($localPath -eq "/") { $localPath = "/index.html" }
            
            # Replace forward slashes with backslashes for Windows paths
            $localPath = $localPath -replace '/', '\'
            $filePath = Join-Path (Get-Location) $localPath
            
            if (Test-Path $filePath -PathType Leaf) {
                $buffer = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $buffer.Length
                
                if ($filePath -match "\.html$") { $response.ContentType = "text/html" }
                elseif ($filePath -match "\.css$") { $response.ContentType = "text/css" }
                elseif ($filePath -match "\.js$") { $response.ContentType = "application/javascript" }
                elseif ($filePath -match "\.jpg$") { $response.ContentType = "image/jpeg" }
                elseif ($filePath -match "\.mp4$") { $response.ContentType = "video/mp4" }
                
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            } else {
                $response.StatusCode = 404
            }
            $response.Close()
        } catch {
            # Ignore cancelled request errors
        }
    }
} finally {
    $listener.Stop()
}
