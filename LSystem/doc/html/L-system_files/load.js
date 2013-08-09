function tellHoudiniToLoad(file, launch, callback) {
    // Use XHR to communicate with an app on the help server,
    // which will then tell Houdini to load the example file.
    
    try {
        var content = "url=" + escape(file) + "&launch=" + launch
        var req = new XMLHttpRequest();
        req.open('POST', "/load_example", true);
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.setRequestHeader("Content-length", content.length);
        req.setRequestHeader("Connection", "close");
        
        req.onreadystatechange = function() {
            if (req.readyState == 4 && req.status == 200) {
                if (callback) {
                    callback(req.responseText);
                }
            } else if (req.readyState == 4) {
                alert("Error loading");
            }
        }
        
        req.send(content);
    } catch(e) {
        alert("tellHoudiniToLoad: " + e);
    }
}

function loadExample(file, launch) {
    try {
        file = getExamplePrefix() + file;
        if (window.RunPythonExpression) {
            // This is an embedded browser, so we can use
            // RunPythonCommand to tell Houdini to load the file.
            exp = "__import__('houdinihelp').load_example(\"" + file + "\", launch='" + launch + "')"
            RunPythonExpression(exp, function(result) {
                if (result != "None") {
                    alert(result);
                }
            });
        } else {
            // This is an external browser, so use XHR to send
            // a request to the help server to load the file.
            
            //alert("tellHoudiniToLoad("+file+", "+launch+")")
            tellHoudiniToLoad(file, launch);
        }
    } catch(e) {
        alert("loadExample: " + e);
    }
}

function getExamplePrefix() {
    var pre = window.examplePrefix;
    if (pre) {
        if (pre.substr(pre.length-1, 1) == "/") {
            return pre.substr(0, pre.length-1);
        } else {
            return pre;
        }
    } else {
        return "$HFS/houdini/help";
    }
}



