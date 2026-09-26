Get-ChildItem -Path .\src -Recurse -Filter *.jsx |
  Select-String -Pattern "workflow-definitions" |
  Select-Object Path -Unique