// DOM Elements
const authTypeEl = document.getElementById("authType");
const username = document.getElementById("username");
const password = document.getElementById("password");
const token = document.getElementById("token");
const url = document.getElementById("url");
const method = document.getElementById("method");
const body = document.getElementById("body");
const responseBodyEl = document.getElementById("response-body");
const responseHeadersEl = document.getElementById("response-headers");
const sendBtn = document.getElementById("sendBtn");
const statusIndicator = document.getElementById("statusIndicator");
const statusText = document.getElementById("statusText");

// Helpers: escape HTML and pretty-print JSON with token classes
function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return "";
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function syntaxHighlight(json) {
    if (typeof json !== 'string') {
        try {
            json = JSON.stringify(json, null, 2);
        } catch (e) {
            json = String(json);
        }
    }
    json = escapeHtml(json);
    return json.replace(/("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?\b/g, function (match) {
        if (/^".*":$/.test(match)) {
            return '<span class="json-key">' + match + '</span>';
        }
        if (/^"/.test(match)) {
            return '<span class="json-string">' + match + '</span>';
        }
        if (/true|false/.test(match)) {
            return '<span class="json-boolean">' + match + '</span>';
        }
        if (/null/.test(match)) {
            return '<span class="json-null">' + match + '</span>';
        }
        return '<span class="json-number">' + match + '</span>';
    });
}

// Show/hide auth fields dynamically
function toggleAuthFields() {
    if (authTypeEl.value === "basic") {
        username.style.display = "block";
        password.style.display = "block";
        token.style.display = "none";
    } else if (authTypeEl.value === "bearer") {
        username.style.display = "none";
        password.style.display = "none";
        token.style.display = "block";
    } else {
        username.style.display = "none";
        password.style.display = "none";
        token.style.display = "none";
    }
}

authTypeEl.addEventListener("change", toggleAuthFields);
toggleAuthFields(); // initial

// Send request
sendBtn.addEventListener("click", send);

async function send() {
    let auth = null;

    // Validate URL first
    if (!url.value || url.value.trim() === "") {
        statusIndicator.className = "status-indicator error";
        statusText.textContent = "Validation Error";
        responseBodyEl.textContent = "Error: URL is required";
        responseHeadersEl.textContent = "";

        // Clear empty state
        const emptyState = document.querySelector(".empty-state");
        if (emptyState) {
            emptyState.style.display = "none";
        }
        return;
    }

    if (authTypeEl.value === "basic") {
        auth = {
            type: "basic",
            username: username.value,
            password: password.value
        };
    } else if (authTypeEl.value === "bearer") {
        auth = {
            type: "bearer",
            token: token.value
        };
    }

    // Validate JSON body
    let jsonBody = null;
    if (body.value.trim() !== "") {
        try {
            jsonBody = JSON.parse(body.value);
        } catch (e) {
            statusIndicator.className = "status-indicator error";
            statusText.textContent = "JSON Parse Error";
            responseBodyEl.textContent = "Invalid JSON: " + e.message;
            responseHeadersEl.textContent = "";

            // Clear empty state
            const emptyState = document.querySelector(".empty-state");
            if (emptyState) {
                emptyState.style.display = "none";
            }
            return;
        }
    }

    // Show loading state
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending...";
    statusIndicator.className = "status-indicator";
    statusText.textContent = "Loading...";

    // Clear empty state
    const emptyState = document.querySelector(".empty-state");
    if (emptyState) {
        emptyState.style.display = "none";
    }

    try {
        const startTime = performance.now();

        const res = await fetch("http://127.0.0.1:9000/send/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                url: url.value,
                method: method.value,
                queryParams: [],
                headers: [],
                body: jsonBody,
                auth
            })
        });

        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        const data = await res.json();

        // Update status indicator
        const status = data.status || "Error";
        if (status >= 200 && status < 300) {
            statusIndicator.className = "status-indicator success";
        } else if (status >= 400) {
            statusIndicator.className = "status-indicator error";
        }
        statusText.textContent = `${status} (${responseTime}ms)`;

        // Fill Body tab (pretty-print and highlight JSON when possible)
        if (data.body !== undefined && data.body !== null) {
            if (typeof data.body === "object") {
                responseBodyEl.innerHTML = '<code class="response-body">' + syntaxHighlight(data.body) + '</code>';
            } else {
                // try parse string as JSON
                try {
                    const parsed = JSON.parse(data.body);
                    responseBodyEl.innerHTML = '<code class="response-body">' + syntaxHighlight(parsed) + '</code>';
                } catch (e) {
                    responseBodyEl.innerHTML = '<code class="response-body">' + escapeHtml(String(data.body)) + '</code>';
                }
            }
        } else {
            responseBodyEl.innerHTML = '<code class="response-body">No body content</code>';
        }

        // Fill Headers tab (render key/value pairs)
        if (data.headers && Object.keys(data.headers).length > 0) {
            let html = '<div class="response-headers">';
            Object.entries(data.headers).forEach(([k, v]) => {
                html += '<div class="header-pair"><div class="header-key">' + escapeHtml(k) + '</div><div class="header-value">' + escapeHtml(v) + '</div></div>';
            });
            html += '</div>';
            responseHeadersEl.innerHTML = html;
        } else {
            responseHeadersEl.innerHTML = '<code class="response-body">No headers</code>';
        }

    } catch (err) {
        statusIndicator.className = "status-indicator error";
        statusText.textContent = "Request Failed";
        responseBodyEl.textContent = "Request failed:\n" + err;
        responseHeadersEl.textContent = "";
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = "Send Request";
    }
}

// Tab switching logic
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const targetTab = btn.dataset.tab;

        // Remove active class from all buttons
        tabButtons.forEach(b => b.classList.remove("active"));

        // Hide all tab contents
        tabContents.forEach(c => {
            c.style.display = "none";
        });

        // Activate clicked tab
        btn.classList.add("active");
        document.getElementById("tab-" + targetTab).style.display = "block";
    });
});