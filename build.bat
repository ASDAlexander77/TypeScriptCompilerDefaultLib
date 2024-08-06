if "%1" == "" (
	call scripts\build_vs.bat release
) else (
	call scripts\build_vs.bat %1
)
