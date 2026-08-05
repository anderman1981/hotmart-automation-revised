# Service Persistence Guide (macOS)

This guide explains how to ensure the Agent System API runs automatically when your computer starts and stays running in the background.

## Automatic Setup

1.  **Copy the LaunchAgent definition**:
    ```bash
    cp com.amrcv.agents.plist ~/Library/LaunchAgents/
    ```

2.  **Load the service**:
    ```bash
    launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.amrcv.agents.plist
    ```
    *(If that command fails on older macOS versions, try: `launchctl load ~/Library/LaunchAgents/com.amrcv.agents.plist`)*

3.  **Verify it's running**:
    ```bash
    curl http://localhost:12000/health
    ```

## Managing the Service

-   **Stop the service**:
    ```bash
    launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.amrcv.agents.plist
    ```
    *(Or: `launchctl unload ~/Library/LaunchAgents/com.amrcv.agents.plist`)*

-   **View Logs**:
    Logs are located in the project directory:
    -   `agent_system.log` (Standard Output)
    -   `agent_system.error.log` (Errors)

## Troubleshooting
If the service doesn't start:
1.  Check the error log: `cat agent_system.error.log`
2.  Ensure `start_service.sh` is executable: `chmod +x /Users/andersonmartinezrestrepo/Projects/amrcv/agents/start_service.sh`
