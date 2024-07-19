chrome.runtime.sendMessage( { message: "get_path_list" }, ( response ) => {
    let style_inject = ""
    response.updated_list.map( (val) => {
        style_inject += `<style>a[href = "${val}"] { display: none !important }</style>`
    }) 
    document.head.innerHTML += style_inject
})

chrome.runtime.onMessage.addListener(( get, _, send) => {
    if ( get.message === "get_path" ) {
        let chat_pathname = window.location.pathname
        if (!chat_pathname.endsWith("/")){
            chat_pathname += "/"
        }
        send( { pathname: chat_pathname } )
        document.head.innerHTML += `<style>a[href = "${chat_pathname}"] { display: none !important }</style>`
    }
    else if( get.message === "add_path_input" ) {
        document.head.innerHTML += `<style>a[href = "${get.pathname}"] { display: none !important }</style>`
    }
    else if( get.message === "uninject_css" ) {
        document.head.innerHTML += `<style>a[href = "${get.pathname}"] { display: initial !important }</style>`
    }
    else if( get.message === "add_path_context") {
        document.head.innerHTML += `<style>a[href = "${get.pathname}"] { display: initial !important }</style>`
    }
})