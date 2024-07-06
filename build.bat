if "%1" == "" (
	call scripts\build.bat release
) else (
	call scripts\build.bat %1
)
