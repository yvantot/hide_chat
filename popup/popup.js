// Note for this project:
// 1. This project would've been more clean if I process the data in service instead of processing them in their own environment
// 2. The processed data will be sent to popup & content
// 3. Also, identify the user's input before starting because the whole code will depend on it 90% of the time
// 4. Knowing where will give you time to plan and make a clean code
// 5. Also, never go more than two underscore with variable names! ITS FUCKING PAIN TO LOOK AT
// 6. More importantly, don't use index to identify elements in your array. It's okay if your elements only have a one state
// 7. But when your element have states such as 'hide', 'done', that data structure will crumble fast as fuck
// 8. Also, functions should only do one thing. The function that updates the storage, cleans the input, handle the UI should be separated.

const handleRender = (arr) => {
    let html_string = ""
    arr.map(( val, ind ) => {                    
        html_string += `<div class="chat-element" id="chat-${ind}">
                            <a href="https://www.messenger.com${val}">${ind}. ${val}</a>
                            <button class="delete-chat">
                                <img src="/assets/delete_chat_icon.svg" alt="Make this chat visible and remove it from the list">
                            </button>            
                        </div>`
    })                
    document.getElementById("chat-list").innerHTML = html_string
    document.querySelectorAll(".delete-chat").forEach( (button, ind) => {
        button.addEventListener('click', () => {            
            document.getElementById(`chat-${ind}`).remove()      
            //Sends message to background script      
            chrome.runtime.sendMessage( { message: "delete_path", index: ind}, ( response ) => {
                handleRender( response.updated_list )
            } )
            //Sends message to content script
            chrome.tabs.query( { active: true, currentWindow: true }, ( tabs ) => {
                chrome.tabs.sendMessage( tabs[0].id, { message: "uninject_css", pathname: arr[ind]})
            })
        })
    })
}

document.getElementById("add-link").addEventListener('keydown', (e) => {
    if ( e.key === 'Enter' && e.target.value.includes("messenger.com")) {        
        let path = e.target.value.replace("https://www.messenger.com", "")
        if (!path.endsWith("/")) {
            path += "/"
        }
        e.target.value = ""        
        //Send message to content to inject the CSS
        chrome.runtime.sendMessage( { message: "add_path", new_path: path }, ( updated_storage ) => {
            chrome.tabs.query( { active: true, currentWindow: true }, ( tabs ) => {
                chrome.tabs.sendMessage( tabs[0].id, { message: "add_path_input", pathname: path})
            })
            //Updates the UI
            handleRender( updated_storage.updated_list )
        })
    }
})

const handleAdd = () => {
    //Get the path from content script
    chrome.tabs.query( { active: true, currentWindow: true }, ( tabs ) => {
        chrome.tabs.sendMessage( tabs[0].id, { message: "get_path" }, (path) => {
            //Send message to background to update the storage
            chrome.runtime.sendMessage( { message: "add_path", new_path: path.pathname }, ( updated_storage ) => {
                //Updates the UI
                handleRender( updated_storage.updated_list )                
            })
        })
    })   
}

(async () => {
    await chrome.runtime.sendMessage( { message: "get_path_list" }, ( response ) => {        
        handleRender( response.updated_list )
    })
    document.getElementById( "add-chat" ).addEventListener( "click", () => {
        handleAdd()
    })    
})()