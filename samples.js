function xhrSample(){
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://icanhazip.com");
    xhr.onload = function() {
        if (xhr.status === 200) {
            addLogLine('XHR GET icanhazip.com success: ' + getPreview(xhr.responseText));
        } else {
            addLogLine('XHR GET icanhazip.com error: ' + xhr.statusText);
        }
    };
    xhr.onerror = function() {
        addLogLine('XHR GET icanhazip.com error: ' + xhr.statusText);
    };
    xhr.send();
}


/**
 * no CORS API request to Ray cluster
 * Returns a Promise that resolves with result or rejects with error message
 */
function oligoXhrSample() {
    const cmdline = "echo done";
    const url = "http://0.0.0.0:8265/api/jobs/";
    // 0.0.0.0 is being filtered already by Chrome and Firefox
    // Chrome
    // net::ERR_ADDRESS_INVALID
    // Firefox
    // NS_ERROR_CONNECTION_REFUSED

    // FIRST – EXECUTE GET REQUEST
    console.log("Starting fetch GET");
    return fetch(url, { mode: 'no-cors'})
        .then((blob) => {
            console.log(blob);
            const txt = blob.text();
            console.log(txt);
            console.log("Starting fetch POST");

            return new Promise((resolve, reject) => {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', url, true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            console.log('Success!:', xhr.responseText);
                            resolve(xhr.responseText);
                        } else {
                            console.error('Error:', xhr.status);
                            reject('POST error: ' + xhr.status);
                        }
                    }
                };
                xhr.onerror = function() {
                    reject('XHR network error');
                };
                xhr.send(JSON.stringify({
                    entrypoint: cmdline,
                    runtime_env: {},
                    job_id: null,
                    metadata: { job_submission_id: 'test-localhost-from-browser' }
                }));
                // Note: xhr.responseText is not available until readyState === DONE
            });
        })
        .catch((err) => {
            console.error("Ray is not running.");
            throw new Error('GET error: Ray is not running.');
        });
}

