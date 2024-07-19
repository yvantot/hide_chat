let chat_list = []
let storage = chrome.storage.local

storage.get('hidden_chat', (result) => {
    if ( result.hidden_chat ) {
        chat_list = result.hidden_chat
    }
    else {
        storage.set( { hidden_chat: [] })
    }
})

chrome.runtime.onInstalled.addListener( () => {
    chrome.contextMenus.create({
        id: "hide_chat_context",
        title: "Hide Chat!: Hide this chat",
        contexts: ["link"]
    })
})

chrome.contextMenus.onClicked.addListener( (info, tab) => {
    let chat_context = info.linkUrl.replace("https://www.messenger.com", "")
    if (!chat_context.endsWith("/")) {
        chat_context += "/"
    }
    if (info.menuItemId === "hide_chat_context") {        
        chat_list.push(chat_context)
        storage.set({ hidden_chat: chat_list})
        //This motherfucker was tricky to find out
        //Turns out this create another content script and not the background script itself        
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: ( chat_path) => {   
                document.head.innerHTML += `<style>a[href="${chat_path}"]{ display: none !important}</style>`
            },
            args: [chat_context]
        })
    }
})

chrome.runtime.onMessage.addListener((get, _, send) => {    
    if ( get.message === "add_path" && !chat_list.includes( get.new_path )){
        chat_list.push( get.new_path )
        storage.set( { hidden_chat: chat_list }, ()=> {
            send( { updated_list: chat_list })
        })
        return true
    }    
    else if ( get.message === "get_path_list" ){
        send( { updated_list: chat_list })
    }
    else if ( get.message === "delete_path" ){
        chat_list.splice(get.index, 1)
        storage.set( { hidden_chat: chat_list })
        send( { updated_list: chat_list })
    }
})