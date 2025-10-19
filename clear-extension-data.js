// GemiNow Extension Data Clearer
// This script helps clear extension data programmatically

console.log("🧹 GemiNow Extension Data Clearer");
console.log("================================");

// Clear Chrome extension storage
async function clearExtensionData() {
    try {
        // Clear all storage
        await chrome.storage.local.clear();
        await chrome.storage.session.clear();
        
        console.log("✅ Extension storage cleared");
        
        // Clear microphone permission flag
        await chrome.storage.local.remove('micGranted');
        console.log("✅ Microphone permission flag cleared");
        
        // Clear any cached data
        if (chrome.storage.local.get) {
            const keys = await chrome.storage.local.get();
            console.log("📊 Remaining storage keys:", Object.keys(keys));
        }
        
        console.log("🎉 Extension data cleared successfully!");
        console.log("");
        console.log("📋 Next steps:");
        console.log("1. Reload the extension in chrome://extensions/");
        console.log("2. Grant microphone permissions when prompted");
        console.log("3. Test the voice functionality");
        
    } catch (error) {
        console.error("❌ Error clearing extension data:", error);
    }
}

// Run the clear function
clearExtensionData();
