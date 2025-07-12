// app/api/download-jwlibrary-installer/route.js

const scriptContent = `#!/bin/bash

# JW Library Linux Wrapper
# A complete wrapper to install and run JW Library on Linux systems
# Version: 1.0
# Provided by Rodgers Digital (https://rodgersdigital.com)

set -e

# Configuration
WRAPPER_NAME="JW Library Wrapper"
WRAPPER_VERSION="1.0"
INSTALL_DIR="$HOME/.jwlibrary"
WINE_PREFIX="$INSTALL_DIR/wine"
DESKTOP_FILE="$HOME/.local/share/applications/jwlibrary.desktop"
ICON_FILE="$INSTALL_DIR/jwlibrary.png"
LOG_FILE="$INSTALL_DIR/wrapper.log"
JW_LIBRARY_URL="https://cfp2.jw-cdn.org/a/339b6d/1/o/ly_E.exe"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Print functions
print_header() {
    echo -e "\\${BLUE}================================\\${NC}"
    echo -e "\\${BLUE}  $WRAPPER_NAME v$WRAPPER_VERSION\\${NC}"
    echo -e "\\${BLUE}  Powered by Rodgers Digital\\${NC}"
    echo -e "\\${BLUE}================================\\${NC}"
}

print_success() {
    echo -e "\\${GREEN}✓ $1\\${NC}"
}

print_error() {
    echo -e "\\${RED}✗ $1\\${NC}"
}

print_info() {
    echo -e "\\${YELLOW}ℹ $1\\${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root"
        exit 1
    fi
}

# Check system requirements
check_requirements() {
    print_info "Checking system requirements..."
    
    # Check if we're on a supported system
    if ! command -v apt-get &> /dev/null && ! command -v dnf &> /dev/null && ! command -v pacman &> /dev/null; then
        print_error "Unsupported package manager. This wrapper supports apt, dnf, and pacman."
        exit 1
    fi
    
    # Check for 64-bit system
    if [[ $(uname -m) != "x86_64" ]]; then
        print_error "64-bit system required"
        exit 1
    fi
    
    print_success "System requirements met"
}

# Check if Wine is installed
check_wine() {
    if command -v wine &> /dev/null; then
        WINE_VERSION=$(wine --version 2>/dev/null)
        print_success "Wine already installed: $WINE_VERSION"
        return 0
    else
        print_info "Wine not found, will install"
        return 1
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Checking dependencies..."
    
    # Check if Wine is already installed
    WINE_INSTALLED=false
    if check_wine; then
        WINE_INSTALLED=true
    fi
    
    # Check other dependencies
    MISSING_DEPS=()
    
    if ! command -v winetricks &> /dev/null; then
        MISSING_DEPS+=("winetricks")
    fi
    
    if ! command -v wget &> /dev/null; then
        MISSING_DEPS+=("wget")
    fi
    
    if ! command -v curl &> /dev/null; then
        MISSING_DEPS+=("curl")
    fi
    
    if ! command -v unzip &> /dev/null; then
        MISSING_DEPS+=("unzip")
    fi
    
    # Install missing dependencies
    if [[ "$WINE_INSTALLED" = false ]] || [[ \${#MISSING_DEPS[@]} -gt 0 ]]; then
        print_info "Installing missing dependencies..."
        
        if command -v apt-get &> /dev/null; then
            # Ubuntu/Debian/Mint
            sudo apt-get update
            if [[ "$WINE_INSTALLED" = false ]]; then
                sudo apt-get install -y wine wine64 wine32
            fi
            if [[ \${#MISSING_DEPS[@]} -gt 0 ]]; then
                sudo apt-get install -y "\${MISSING_DEPS[@]}"
            fi
        elif command -v dnf &> /dev/null; then
            # Fedora
            if [[ "$WINE_INSTALLED" = false ]]; then
                sudo dnf install -y wine
            fi
            if [[ \${#MISSING_DEPS[@]} -gt 0 ]]; then
                sudo dnf install -y "\${MISSING_DEPS[@]}"
            fi
        elif command -v pacman &> /dev/null; then
            # Arch Linux
            INSTALL_PACKAGES=()
            if [[ "$WINE_INSTALLED" = false ]]; then
                INSTALL_PACKAGES+=("wine")
            fi
            INSTALL_PACKAGES+=("\${MISSING_DEPS[@]}")
            if [[ \${#INSTALL_PACKAGES[@]} -gt 0 ]]; then
                sudo pacman -S --needed "\${INSTALL_PACKAGES[@]}"
            fi
        fi
        
        print_success "Dependencies installed"
    else
        print_success "All dependencies already installed"
    fi
}

# Setup Wine environment
setup_wine() {
    print_info "Setting up Wine environment..."
    
    # Create wine prefix
    mkdir -p "$INSTALL_DIR"
    export WINEPREFIX="$WINE_PREFIX"
    export WINEARCH="win64"
    
    # Initialize wine prefix
    print_info "Initializing Wine (this may take a few minutes)..."
    wine --version > /dev/null 2>&1 || winecfg
    
    # Configure Wine for JW Library
    print_info "Configuring Wine for optimal JW Library performance..."
    
    # Set Windows version to Windows 10
    winetricks -q win10
    
    # Install necessary components
    winetricks -q corefonts vcrun2019 dotnet48
    
    # Configure Wine registry settings
    wine reg add "HKEY_CURRENT_USER\\\\Software\\\\Wine\\\\DirectSound" /v "DefaultBitsPerSample" /t REG_DWORD /d 16 /f
    wine reg add "HKEY_CURRENT_USER\\\\Software\\\\Wine\\\\DirectSound" /v "DefaultSampleRate" /t REG_DWORD /d 44100 /f
    
    print_success "Wine environment configured"
}

# Download JW Library
download_jwlibrary() {
    print_info "Downloading JW Library..."
    
    cd "$INSTALL_DIR"
    
    # Download the installer
    if wget -O "JWLibrary_installer.exe" "$JW_LIBRARY_URL"; then
        print_success "JW Library downloaded successfully"
    else
        print_error "Failed to download JW Library"
        print_info "Please download manually from: $JW_LIBRARY_URL"
        print_info "Save it as: $INSTALL_DIR/JWLibrary_installer.exe"
        read -p "Press Enter when download is complete..."
    fi
}

# Install JW Library
install_jwlibrary() {
    print_info "Installing JW Library..."
    
    export WINEPREFIX="$WINE_PREFIX"
    cd "$INSTALL_DIR"
    
    # Install JW Library
    wine "JWLibrary_installer.exe" /S
    
    # Wait for installation to complete
    sleep 5
    
    # Find the installation path
    JW_LIBRARY_PATH=$(find "$WINE_PREFIX/drive_c" -name "JWLibrary.exe" 2>/dev/null | head -1)
    
    if [[ -n "$JW_LIBRARY_PATH" ]]; then
        print_success "JW Library installed successfully"
        echo "JW_LIBRARY_PATH=\\"$JW_LIBRARY_PATH\\"" > "$INSTALL_DIR/config"
    else
        print_error "JW Library installation failed"
        exit 1
    fi
}

# Create desktop integration
create_desktop_integration() {
    print_info "Creating desktop integration..."
    
    # Create application icon (base64 encoded PNG)
    cat > "$ICON_FILE" << 'EOF'
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==
EOF
    
    # Create desktop file
    cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=JW Library
Comment=JW Library for Linux (Installed via Rodgers Digital)
Exec=$INSTALL_DIR/jwlibrary-launcher.sh
Icon=$ICON_FILE
Terminal=false
Categories=Education;
StartupNotify=true
EOF
    
    # Create launcher script
    cat > "$INSTALL_DIR/jwlibrary-launcher.sh" << 'EOF'
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config"
export WINEPREFIX="$SCRIPT_DIR/wine"
cd "$SCRIPT_DIR"
wine "$JW_LIBRARY_PATH" "$@" 2>/dev/null
EOF
    
    chmod +x "$INSTALL_DIR/jwlibrary-launcher.sh"
    chmod +x "$DESKTOP_FILE"
    
    print_success "Desktop integration created"
}

# Create uninstaller
create_uninstaller() {
    cat > "$INSTALL_DIR/uninstall.sh" << 'EOF'
#!/bin/bash
echo "Uninstalling JW Library Wrapper..."
rm -rf "$HOME/.jwlibrary"
rm -f "$HOME/.local/share/applications/jwlibrary.desktop"
echo "JW Library Wrapper uninstalled successfully"
echo "Thank you for using Rodgers Digital tools!"
EOF
    
    chmod +x "$INSTALL_DIR/uninstall.sh"
    print_success "Uninstaller created at $INSTALL_DIR/uninstall.sh"
}

# Main installation function
install() {
    print_header
    log "Starting JW Library installation"
    
    check_root
    check_requirements
    install_dependencies
    setup_wine
    download_jwlibrary
    install_jwlibrary
    create_desktop_integration
    create_uninstaller
    
    print_success "Installation completed successfully!"
    print_info "You can now:"
    print_info "• Find JW Library in your applications menu"
    print_info "• Run it from terminal: $INSTALL_DIR/jwlibrary-launcher.sh"
    print_info "• Uninstall using: $INSTALL_DIR/uninstall.sh"
    print_info "• Check logs at: $LOG_FILE"
    print_info ""
    print_info "This installer was provided by Rodgers Digital"
    print_info "Visit us at: https://rodgersdigital.com"
    
    log "Installation completed successfully"
}

# Run JW Library
run() {
    if [[ ! -f "$INSTALL_DIR/config" ]]; then
        print_error "JW Library not installed. Run: $0 install"
        exit 1
    fi
    
    source "$INSTALL_DIR/config"
    export WINEPREFIX="$WINE_PREFIX"
    
    print_info "Starting JW Library..."
    cd "$INSTALL_DIR"
    wine "$JW_LIBRARY_PATH" "$@" 2>/dev/null &
}

# Update function
update() {
    print_info "Updating JW Library..."
    
    if [[ ! -f "$INSTALL_DIR/config" ]]; then
        print_error "JW Library not installed. Run: $0 install"
        exit 1
    fi
    
    download_jwlibrary
    install_jwlibrary
    
    print_success "Update completed!"
}

# Show help
show_help() {
    print_header
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  install    - Install JW Library"
    echo "  run        - Run JW Library"
    echo "  update     - Update JW Library"
    echo "  uninstall  - Uninstall JW Library"
    echo "  help       - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 install"
    echo "  $0 run"
    echo ""
    echo "This installer is provided by Rodgers Digital"
    echo "Visit: https://rodgersdigital.com"
}

# Main script logic
case "\${1:-}" in
    "install")
        install
        ;;
    "run")
        shift
        run "$@"
        ;;
    "update")
        update
        ;;
    "uninstall")
        if [[ -f "$INSTALL_DIR/uninstall.sh" ]]; then
            bash "$INSTALL_DIR/uninstall.sh"
        else
            print_error "Uninstaller not found"
        fi
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    "")
        # If no arguments, try to run if installed, otherwise show help
        if [[ -f "$INSTALL_DIR/config" ]]; then
            run
        else
            show_help
        fi
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac`;

export async function GET() {
  return new Response(scriptContent, {
    headers: {
      'Content-Type': 'application/x-sh',
      'Content-Disposition': 'attachment; filename="jwlibrary-wrapper.sh"',
      'Cache-Control': 'no-cache',
    },
  });
}