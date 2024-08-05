if "%1" == "" (
	set BUILD=release
) else (
	set BUILD=debug
)

for /f %%f in ('dir /b .\tests') do call scripts\test.bat %%~nf %BUILD%