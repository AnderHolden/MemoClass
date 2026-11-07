<#
.SYNOPSIS
  Servidor HTTP Local para MemoClass AI (PWA)
  Autores: Iván Andrés Urbano Rivera y Lucy Adriana Muñoz Cabrera
#>
param(
  [int]$Port = 8080,
  [string]$Root = $PSScriptRoot
)

$mimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.ico'  = 'image/x-icon'
  '.md'   = 'text/markdown; charset=utf-8'
}

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " MemoClass AI - Servidor Local PWA Activo en $prefix" -ForegroundColor Green
Write-Host " Autores: Iván Andrés Urbano Rivera y Lucy Adriana Muñoz Cabrera" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $localPath = $request.Url.LocalPath
    if ([string]::IsNullOrEmpty($localPath) -or $localPath -eq '/') {
      $localPath = '/index.html'
    }

    $safeRelative = $localPath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
    $filePath = Join-Path $Root $safeRelative

    if (Test-Path $filePath -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
      $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { 'application/octet-stream' }
      $bytes = [System.IO.File]::ReadAllBytes($filePath)

      $response.StatusCode = 200
      $response.ContentType = $contentType
      $response.Headers.Add('Cache-Control', 'no-cache')
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $response.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $localPath")
      $response.ContentLength64 = $msg.Length
      $response.OutputStream.Write($msg, 0, $msg.Length)
    }
    $response.OutputStream.Close()
  }
} finally {
  $listener.Stop()
}
