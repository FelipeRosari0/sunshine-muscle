@echo off
::#############################################################################
:: Gradle startup script for Windows
::#############################################################################

set DIR=%~dp0
set APP_HOME=%DIR%
set CLASSPATH=%APP_HOME%gradle\wrapper\gradle-wrapper.jar

if not defined JAVA_HOME goto findJavaFromPath
set JAVA_EXE=%JAVA_HOME%\bin\java.exe
goto init

:findJavaFromPath
for %%i in (java.exe) do set JAVA_EXE=%%~$PATH:i
if not defined JAVA_EXE (
  echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
  exit /b 1
)

:init
"%JAVA_EXE%" %JAVA_OPTS% -Dfile.encoding=UTF-8 -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*