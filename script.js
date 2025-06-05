document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const searchButton = document.getElementById('searchButton');
    const typingIndicator = document.getElementById('typingIndicator');
    const codePreview = document.getElementById('codePreview');
    const codeContent = document.getElementById('codeContent');
    const copyCode = document.getElementById('copyCode');
    const runCode = document.getElementById('runCode');
    const closeCode = document.getElementById('closeCode');
    const codeOutput = document.getElementById('codeOutput');

    // ضبط لغة الصفحة تلقائياً
    function setLanguage() {
        const userLang = navigator.language || navigator.userLanguage;
        if (userLang.startsWith('ar')) {
            document.documentElement.lang = 'ar';
            document.documentElement.dir = 'rtl';
        } else {
            document.documentElement.lang = 'en';
            document.documentElement.dir = 'ltr';
        }
    }

    setLanguage();

    // توسيع منطقة النص تلقائياً
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
    });

    // إرسال الرسالة عند الضغط على Enter
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // نسخ الكود
    copyCode.addEventListener('click', () => {
        navigator.clipboard.writeText(codeContent.textContent)
            .then(() => {
                copyCode.innerHTML = '<i class="fas fa-check"></i> تم النسخ!';
                setTimeout(() => {
                    copyCode.innerHTML = '<i class="far fa-copy"></i> نسخ';
                }, 2000);
            });
    });

    // تشغيل الكود
    runCode.addEventListener('click', () => {
        const code = codeContent.textContent;
        codeOutput.srcdoc = `<!DOCTYPE html><html><head><style>body { padding: 20px; }</style></head><body>${code}</body></html>`;
        codeOutput.style.display = 'block';
    });

    // إغلاق معاينة الكود
    closeCode.addEventListener('click', () => {
        codePreview.style.display = 'none';
        codeOutput.style.display = 'none';
    });

    // إرسال الرسالة
    sendButton.addEventListener('click', sendMessage);

    // البحث على الإنترنت
    searchButton.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            userInput.value = '';
            userInput.style.height = 'auto';
            
            showTypingIndicator();
            
            // استخدام محرك البحث (هنا يمكنك إضافة API للبحث)
            KOKOAI.searchWeb(message)
                .then(response => {
                    hideTypingIndicator();
                    addMessage(response, 'ai');
                })
                .catch(error => {
                    hideTypingIndicator();
                    addMessage(`حدث خطأ أثناء البحث: ${error.message}`, 'ai');
                });
        }
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            userInput.value = '';
            userInput.style.height = 'auto';
            
            showTypingIndicator();
            
            // إرسال إلى الذكاء الاصطناعي
            KOKOAI.processMessage(message)
                .then(response => {
                    hideTypingIndicator();
                    
                    if (response.code) {
                        addMessage(response.text, 'ai');
                        showCodePreview(response.code, response.language);
                    } else {
                        addMessage(response, 'ai');
                    }
                })
                .catch(error => {
                    hideTypingIndicator();
                    addMessage(`حدث خطأ: ${error.message}`, 'ai');
                });
        }
    }

    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = formatMessage(content);
        
        messageDiv.appendChild(contentDiv);
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function formatMessage(text) {
        // تحويل الروابط إلى روابط قابلة للنقر
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // تحويل الكود المحدد بـ backticks
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // تحويل الكود المحدد بـ triple backticks
        text = text.replace(/```(\w*)\n([^`]+)```/gs, (match, lang, code) => {
            return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
        });
        
        return text;
    }

    function showTypingIndicator() {
        typingIndicator.style.display = 'block';
        sendButton.disabled = true;
        searchButton.disabled = true;
    }

    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
        sendButton.disabled = false;
        searchButton.disabled = false;
    }

    function showCodePreview(code, language = 'javascript') {
        codeContent.textContent = code;
        codeContent.className = `language-${language}`;
        codePreview.style.display = 'flex';
        
        // تمييز الصyntax إذا كانت مكتبة Prism موجودة
        if (window.Prism) {
            Prism.highlightElement(codeContent);
        }
    }
});

// تأثيرات عند تحميل الصفحة
window.addEventListener('load', () => {
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.classList.add('loaded');
});
