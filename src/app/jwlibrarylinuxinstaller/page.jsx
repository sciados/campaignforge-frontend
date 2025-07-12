'use client';

import { useState, useEffect, useCallback } from 'react';

export default function JWLibraryLinuxInstaller() {
  const [activeTab, setActiveTab] = useState('upload');
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [terminalContent, setTerminalContent] = useState([]);
  const [mounted, setMounted] = useState(false);

  // The complete bash script content
  const scriptContent = `#!/bin/bash

# JW Library Linux Wrapper
# A complete wrapper to install and run JW Library on Linux systems
# Version: 1.0

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
    echo -e "\\$\{BLUE\}================================\\$\{NC\}"
    echo -e "\\$\{BLUE\}  $WRAPPER_NAME v$WRAPPER_VERSION\\$\{NC\}"
    echo -e "\\$\{BLUE\}================================\\$\{NC\}"
}

print_success() {
    echo -e "\\$\{GREEN\}✓ $1\\$\{NC\}"
}

print_error() {
    echo -e "\\$\{RED\}✗ $1\\$\{NC\}"
}

print_info() {
    echo -e "\\$\{YELLOW\}ℹ $1\\$\{NC\}"
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
    if [[ "$WINE_INSTALLED" = false ]] || [[ \\$\{#MISSING_DEPS[@]\} -gt 0 ]]; then
        print_info "Installing missing dependencies..."
        
        if command -v apt-get &> /dev/null; then
            # Ubuntu/Debian/Mint
            sudo apt-get update
            if [[ "$WINE_INSTALLED" = false ]]; then
                sudo apt-get install -y wine wine64 wine32
            fi
            if [[ \\$\{#MISSING_DEPS[@]\} -gt 0 ]]; then
                sudo apt-get install -y "\\$\{MISSING_DEPS[@]\}"
            fi
        elif command -v dnf &> /dev/null; then
            # Fedora
            if [[ "$WINE_INSTALLED" = false ]]; then
                sudo dnf install -y wine
            fi
            if [[ \\$\{#MISSING_DEPS[@]\} -gt 0 ]]; then
                sudo dnf install -y "\\$\{MISSING_DEPS[@]\}"
            fi
        elif command -v pacman &> /dev/null; then
            # Arch Linux
            INSTALL_PACKAGES=()
            if [[ "$WINE_INSTALLED" = false ]]; then
                INSTALL_PACKAGES+=("wine")
            fi
            INSTALL_PACKAGES+=("\\$\{MISSING_DEPS[@]\}")
            if [[ \\$\{#INSTALL_PACKAGES[@]\} -gt 0 ]]; then
                sudo pacman -S --needed "\\$\{INSTALL_PACKAGES[@]\}"
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
    wine reg add "HKEY_CURRENT_USER\\\\\\\\Software\\\\\\\\Wine\\\\\\\\DirectSound" /v "DefaultBitsPerSample" /t REG_DWORD /d 16 /f
    wine reg add "HKEY_CURRENT_USER\\\\\\\\Software\\\\\\\\Wine\\\\\\\\DirectSound" /v "DefaultSampleRate" /t REG_DWORD /d 44100 /f
    
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
Comment=JW Library for Linux
Exec=$INSTALL_DIR/jwlibrary-launcher.sh
Icon=$ICON_FILE
Terminal=false
Categories=Education;
StartupNotify=true
EOF
    
    # Create launcher script
    cat > "$INSTALL_DIR/jwlibrary-launcher.sh" << 'EOF'
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "\\$\{BASH_SOURCE[0]\}")" && pwd)"
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
}

# Main script logic
case "\\$\{1:-\}" in
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

  const addTerminalOutput = (message, type = 'info') => {
    const newOutput = { message, type, timestamp: Date.now() };
    setTerminalContent(prev => [...prev, newOutput]);
  };

  const downloadScript = useCallback(() => {
    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jwlibrary-wrapper.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    setTerminalVisible(true);
    addTerminalOutput('✓ Downloaded jwlibrary-wrapper.sh successfully!', 'success');
    addTerminalOutput('ℹ Now open a terminal and run:', 'info');
    addTerminalOutput('  chmod +x jwlibrary-wrapper.sh', 'command');
    addTerminalOutput('  ./jwlibrary-wrapper.sh install', 'command');
  }, [scriptContent]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  };

  const CopyButton = ({ text, children }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      await copyToClipboard(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };

    return (
      <button
        onClick={handleCopy}
        className={`ml-2 px-2 py-1 text-xs rounded transition-all duration-200 ${
          copied 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-500 text-white hover:bg-gray-600'
        }`}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    );
  };

  useEffect(() => {
    setMounted(true);
    
    // Add keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        downloadScript();
      }
      
      if (e.key >= '1' && e.key <= '3') {
        const tabs = ['upload', 'manual', 'requirements'];
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [downloadScript]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Header with gradient border */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-black to-gray-600"></div>
        <div className="text-center py-12 px-8">
          <h1 className="text-4xl md:text-5xl font-light text-black mb-4">
            JW Library Linux Installer
          </h1>
          <p className="text-xl text-gray-600">
            Easy installation of JW Library on any Linux distribution
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Powered by <span className="font-semibold text-black">RodgersDigital</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {[
          { id: 'upload', label: '🚀 Easy Install', key: '1' },
          { id: 'manual', label: '📝 Manual Install', key: '2' },
          { id: 'requirements', label: 'ℹ️ Requirements', key: '3' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 px-6 text-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'text-black border-b-2 border-black bg-white'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs text-gray-400">({tab.key})</span>
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto p-8">
        {/* Easy Install Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-8">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-semibold text-black mb-6">Step 1: Download the Installer</h2>
              <p className="text-gray-600 mb-6">Click the button below to download the JW Library installer script for Linux.</p>
              <button
                onClick={downloadScript}
                className="bg-black text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-900 transition-all duration-200"
              >
                📥 Download Installer Script
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-semibold text-black mb-6">Step 2: Run the Installer</h2>
              <p className="text-gray-600 mb-6">After downloading, open a terminal and run these commands:</p>
              <div className="space-y-4">
                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  chmod +x jwlibrary-wrapper.sh
                  <CopyButton text="chmod +x jwlibrary-wrapper.sh" />
                </div>
                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  ./jwlibrary-wrapper.sh install
                  <CopyButton text="./jwlibrary-wrapper.sh install" />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-semibold text-black mb-6">Step 3: Launch JW Library</h2>
              <p className="text-gray-600 mb-6">Once installed, you can run JW Library in several ways:</p>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
                ./jwlibrary-wrapper.sh run
                <CopyButton text="./jwlibrary-wrapper.sh run" />
              </div>
              <p className="text-gray-600">Or find it in your applications menu!</p>
            </div>

            {terminalVisible && (
              <div className="bg-black rounded-xl overflow-hidden border border-gray-200">
                <div className="flex items-center justify-between p-4 bg-gray-900">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-gray-400 text-sm font-mono">JW Library Installer</div>
                </div>
                <div className="p-4 h-64 overflow-y-auto font-mono text-sm">
                  {terminalContent.map((line, index) => (
                    <div
                      key={index}
                      className={`mb-1 ${
                        line.type === 'success' ? 'text-green-400' :
                        line.type === 'error' ? 'text-red-400' :
                        line.type === 'command' ? 'text-blue-400' :
                        'text-gray-300'
                      }`}
                    >
                      {line.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Install Tab */}
        {activeTab === 'manual' && (
          <div className="space-y-8">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-semibold text-black mb-6">Manual Installation Steps</h2>
              <p className="text-gray-600 mb-8">If you prefer to install manually, follow these steps:</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4">1. Install Dependencies</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 mb-2">Ubuntu/Debian/Mint:</p>
                      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        sudo apt-get update && sudo apt-get install -y wine winetricks wget curl unzip
                        <CopyButton text="sudo apt-get update && sudo apt-get install -y wine winetricks wget curl unzip" />
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 mb-2">Fedora:</p>
                      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        sudo dnf install -y wine winetricks wget curl unzip
                        <CopyButton text="sudo dnf install -y wine winetricks wget curl unzip" />
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 mb-2">Arch Linux:</p>
                      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        sudo pacman -S --needed wine winetricks wget curl unzip
                        <CopyButton text="sudo pacman -S --needed wine winetricks wget curl unzip" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-4">2. Create Wine Environment</h3>
                  <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    export WINEPREFIX=&quot;$HOME/.jwlibrary/wine&quot;<br/>
                    export WINEARCH=&quot;win64&quot;<br/>
                    winecfg
                    <CopyButton text={`export WINEPREFIX="$HOME/.jwlibrary/wine"\nexport WINEARCH="win64"\nwinecfg`} />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-4">3. Install Windows Components</h3>
                  <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    winetricks -q win10 corefonts vcrun2019 dotnet48
                    <CopyButton text="winetricks -q win10 corefonts vcrun2019 dotnet48" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-4">4. Download and Install JW Library</h3>
                  <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    wget -O JWLibrary_installer.exe https://cfp2.jw-cdn.org/a/339b6d/1/o/ly_E.exe<br/>
                    wine JWLibrary_installer.exe
                    <CopyButton text={`wget -O JWLibrary_installer.exe https://cfp2.jw-cdn.org/a/339b6d/1/o/ly_E.exe\nwine JWLibrary_installer.exe`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requirements Tab */}
        {activeTab === 'requirements' && (
          <div className="space-y-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-yellow-800 mb-4">System Requirements</h3>
              <ul className="text-yellow-800 space-y-2 ml-6">
                <li className="list-disc">64-bit Linux system (x86_64)</li>
                <li className="list-disc">Ubuntu 18.04+, Debian 10+, Linux Mint 19+, Fedora 30+, or Arch Linux</li>
                <li className="list-disc">At least 2GB free disk space</li>
                <li className="list-disc">Internet connection for downloading components</li>
                <li className="list-disc">Administrator privileges (sudo access)</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-semibold text-black mb-6">Supported Distributions</h2>
              <p className="text-gray-600 mb-4">This installer has been tested on:</p>
              <ul className="text-gray-600 space-y-1 ml-6">
                <li className="list-disc">Ubuntu 20.04, 22.04, 24.04</li>
                <li className="list-disc">Linux Mint 20, 21, 22</li>
                <li className="list-disc">Debian 10, 11, 12</li>
                <li className="list-disc">Fedora 35, 36, 37+</li>
                <li className="list-disc">Arch Linux (current)</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-semibold text-black mb-6">Troubleshooting</h2>
              <p className="text-gray-600 mb-4">If you encounter issues:</p>
              <ul className="text-gray-600 space-y-2 ml-6">
                <li className="list-disc">Check the log file: <code className="bg-gray-200 px-2 py-1 rounded">~/.jwlibrary/wrapper.log</code></li>
                <li className="list-disc">Ensure your system is up to date</li>
                <li className="list-disc">Try running the installer with verbose output</li>
                <li className="list-disc">Check Wine version compatibility</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Need Help?</h3>
              <p className="text-blue-800 mb-4">
                If you need assistance with the installation, feel free to reach out:
              </p>
              <div className="space-y-2">
                <p className="text-blue-700">
                  📧 <strong>Email:</strong> support@rodgersdigital.com
                </p>
                <p className="text-blue-700">
                  🌐 <strong>Website:</strong> <a href="https://rodgersdigital.com" className="underline hover:text-blue-900">rodgersdigital.com</a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-600 text-sm mb-4 md:mb-0">
            © 2025 RodgersDigital. This tool is provided free of charge.
          </div>
          <div className="flex space-x-4 text-sm">
            <span className="text-gray-500">v1.0</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">Keyboard shortcuts: Ctrl+D (download), 1-3 (tabs)</span>
          </div>
        </div>
      </div>

      {/* Floating version indicator */}
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-70 text-white text-xs px-3 py-2 rounded-full font-mono">
        v1.0
      </div>
    </div>
  );
}