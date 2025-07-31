// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const generateBtn = document.getElementById('generate-btn');
const clearBtn = document.getElementById('clear-btn');
const randomBtn = document.getElementById('random-btn');
const copyBtn = document.getElementById('copy-btn');
const promptResult = document.getElementById('prompt-result');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeModalBtn = document.getElementById('close-modal');
const saveSettingsBtn = document.getElementById('save-settings');
const testLLMBtn = document.getElementById('test-llm');

// Current active tab
let currentTab = 'video';

// Current language
let currentLanguage = 'en';

// LLM Settings - Will be merged with injected config if available
let llmSettings = {
    provider: 'openrouter',
    openaiKey: '',
    openrouterKey: '',
    openrouterModel: 'anthropic/claude-3.5-sonnet',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama2',
    localUrl: 'http://localhost:8080',
    temperature: 0.7,
    maxTokens: 300
};

// Apply injected configuration if available
if (window.API_CONFIG) {
    llmSettings = { ...llmSettings, ...window.API_CONFIG };
    console.log('Applied injected API configuration');
}

// Internationalization translations
const translations = {
    en: {
        title: 'AI Prompt Generator',
        subtitle: 'Create stunning prompts for video and photo generation',
        'video-tab': 'Video Prompts',
        'photo-tab': 'Photo Prompts',
        'objects-label': 'Objects/Protagonist:',
        'actions-label': 'Actions:',
        'angles-label': 'Camera Angles:',
        'environments-label': 'Environments:',
        'elements-label': 'Visual Elements:',
        'styles-label': 'Styles:',
        'proportions-label': 'Aspect Ratios:',
        'other-label': 'Other Elements:',
        'select-objects': 'Select Objects/Protagonist',
        'select-actions': 'Select Action',
        'select-angles': 'Select Camera Angle',
        'select-environments': 'Select Environment',
        'select-elements': 'Select Visual Elements',
        'select-styles': 'Select Style',
        'select-proportions': 'Select Aspect Ratio',
        'generate-btn': 'Generate Prompt',
        'clear-btn': 'Clear All',
        'random-btn': 'Random',
        'copy-btn': 'Copy',
        'settings-btn': 'LLM Settings',
        'prompt-title': 'Generated Prompt',
        'prompt-placeholder': 'Your generated prompt will appear here...',
        'tips-title': 'Tips for Better AI Prompts',
        'tip-1': 'AI Enhancement: The AI will transform your selections into professional prompts',
        'tip-2': 'Be specific: More detailed selections lead to better AI-generated prompts',
        'tip-3': 'Combine elements: Mix different categories for unique results',
        'tip-4': 'Use "Other Elements": Add specific details for the AI to incorporate',
        'tip-5': 'Try different providers: Each AI model has its own style and strengths',
        'tip-6': 'Experiment: Use the random generator for inspiration',
        'footer-text': '© 2024 AI Prompt Generator. Perfect for beginners and professionals.',
        'custom': 'Custom'
    },
    'zh-TW': {
        title: 'AI 提示詞產生器',
        subtitle: '為影片和照片生成創建精美的提示詞',
        'video-tab': '影片提示詞',
        'photo-tab': '照片提示詞',
        'objects-label': '物件/主角：',
        'actions-label': '動作：',
        'angles-label': '攝影角度：',
        'environments-label': '環境：',
        'elements-label': '視覺元素：',
        'styles-label': '風格：',
        'proportions-label': '長寬比：',
        'other-label': '其他元素：',
        'select-objects': '選擇物件/主角',
        'select-actions': '選擇動作',
        'select-angles': '選擇攝影角度',
        'select-environments': '選擇環境',
        'select-elements': '選擇視覺元素',
        'select-styles': '選擇風格',
        'select-proportions': '選擇長寬比',
        'generate-btn': '生成提示詞',
        'clear-btn': '清除全部',
        'random-btn': '隨機',
        'copy-btn': '複製',
        'settings-btn': 'LLM 設定',
        'prompt-title': '生成的提示詞',
        'prompt-placeholder': '您生成的提示詞將在此處顯示...',
        'tips-title': '更好的 AI 提示詞技巧',
        'tip-1': 'AI 增強：AI 將把您的選擇轉換為專業提示詞',
        'tip-2': '具體明確：更詳細的選擇會產生更好的 AI 生成提示詞',
        'tip-3': '組合元素：混合不同類別以獲得獨特結果',
        'tip-4': '使用「其他元素」：添加具體細節供 AI 整合',
        'tip-5': '嘗試不同提供商：每個 AI 模型都有自己的風格和優勢',
        'tip-6': '實驗：使用隨機生成器獲得靈感',
        'footer-text': '© 2024 AI 提示詞產生器。適合初學者和專業人士。',
        'custom': '自訂'
    }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeEventListeners();
    setupCustomInputs();
    initializeSettings();
    loadSettings();
    initializeLanguage();
});

// Tab functionality
function initializeTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    // Update tab buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    // Update tab content
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabId}-tab`).classList.add('active');
    
    currentTab = tabId;
    
    // Clear previous results when switching tabs
    promptResult.textContent = 'Your generated prompt will appear here...';
    promptResult.classList.add('empty');
}

// Event listeners
function initializeEventListeners() {
    generateBtn.addEventListener('click', generatePrompt);
    clearBtn.addEventListener('click', clearAllFields);
    randomBtn.addEventListener('click', generateRandomPrompt);
    copyBtn.addEventListener('click', copyPrompt);
    settingsBtn.addEventListener('click', openSettings);
    closeModalBtn.addEventListener('click', closeSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    testLLMBtn.addEventListener('click', testLLMConnection);
    
    // Close modal when clicking outside
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettings();
        }
    });
}

// Setup custom inputs to show when "custom" options are selected
function setupCustomInputs() {
    const categories = ['objects', 'actions', 'angles', 'environments', 'elements', 'styles', 'proportions'];
    const tabs = ['video', 'photo'];
    
    tabs.forEach(tab => {
        categories.forEach(category => {
            const select = document.getElementById(`${tab}-${category}`);
            const customInput = document.getElementById(`${tab}-${category}-custom`);
            
            if (select && customInput) {
                select.addEventListener('change', function() {
                    customInput.style.display = this.value === 'custom' ? 'block' : 'none';
                });
                
                // Initially hide custom inputs
                customInput.style.display = 'none';
            }
        });
    });
}

// Generate prompt using LLM-powered enhancement
async function generatePrompt() {
    const prefix = currentTab === 'video' ? 'video' : 'photo';
    
    // Get all form elements for current tab
    const objects = getFieldValue(`${prefix}-objects`);
    const actions = getFieldValue(`${prefix}-actions`);
    const angles = getFieldValue(`${prefix}-angles`);
    const environments = getFieldValue(`${prefix}-environments`);
    const visualElements = getFieldValue(`${prefix}-elements`);
    const styles = getFieldValue(`${prefix}-styles`);
    const proportions = getFieldValue(`${prefix}-proportions`);
    const other = document.getElementById(`${prefix}-other`).value.trim();
    
    // Check if we have any selections
    const hasSelections = objects || actions || angles || environments || visualElements || styles || proportions || other;
    
    if (!hasSelections) {
        displayPrompt('Please select some options to generate a prompt!');
        return;
    }
    
    // Show loading state
    const removeLoading = addLoadingState(generateBtn);
    
    try {
        // Generate enhanced prompt using LLM
        const enhancedPrompt = await generateLLMPrompt({
            type: currentTab,
            objects,
            actions,
            angles,
            environments,
            visualElements,
            styles,
            proportions,
            other
        });
        
        displayPrompt(enhancedPrompt);
    } catch (error) {
        console.error('LLM generation failed, falling back to basic prompt:', error);
        
        // Fallback to basic prompt generation
        const basicPrompt = generateBasicPrompt({
            type: currentTab,
            objects,
            actions,
            angles,
            environments,
            visualElements,
            styles,
            proportions,
            other
        });
        
        displayPrompt(basicPrompt);
        showNotification('Using basic prompt generation (LLM unavailable)', 'warning');
    } finally {
        removeLoading();
    }
}

// LLM-powered prompt generation
async function generateLLMPrompt(selections) {
    const { type, objects, actions, angles, environments, visualElements, styles, proportions, other } = selections;
    
    // Create a structured prompt for the LLM
    const systemPrompt = `You are an expert AI prompt engineer specializing in ${type} generation prompts. Your task is to create a detailed, professional prompt for AI ${type} generation tools like Midjourney, DALL-E, Runway, or Stable Diffusion.

Given the user's selections, create a cohesive, well-structured prompt that:
1. Flows naturally and reads professionally
2. Incorporates all provided elements seamlessly
3. Adds appropriate technical and artistic details
4. Uses industry-standard terminology
5. Is optimized for AI ${type} generation

Return only the final prompt without explanations.`;
    
    const userPrompt = `Create a ${type} generation prompt using these elements:
${objects ? `Subject/Object: ${objects}` : ''}
${actions ? `Action/Pose: ${actions}` : ''}
${angles ? `Camera Angle: ${angles}` : ''}
${environments ? `Environment: ${environments}` : ''}
${visualElements ? `Visual Elements: ${visualElements}` : ''}
${styles ? `Style: ${styles}` : ''}
${proportions ? `Aspect Ratio: ${proportions}` : ''}
${other ? `Additional Details: ${other}` : ''}`;
    
    // Try providers based on settings
    let providers = [];
    
    switch (llmSettings.provider) {
        case 'openai':
            providers = [() => callOpenAI(systemPrompt, userPrompt)];
            break;
        case 'openrouter':
            providers = [() => callOpenRouter(systemPrompt, userPrompt)];
            break;
        case 'ollama':
            providers = [() => callOllama(systemPrompt, userPrompt)];
            break;
        case 'local':
            providers = [() => callLocalLLM(systemPrompt, userPrompt)];
            break;
        case 'basic':
            // Skip LLM, use basic generation
            return null;
        default: // 'auto'
            providers = [
                () => callOpenAI(systemPrompt, userPrompt),
                () => callOpenRouter(systemPrompt, userPrompt),
                () => callOllama(systemPrompt, userPrompt),
                () => callLocalLLM(systemPrompt, userPrompt)
            ];
    }
    
    for (const provider of providers) {
        try {
            const result = await provider();
            if (result) {
                return result.trim();
            }
        } catch (error) {
            console.log('LLM provider failed:', error.message);
        }
    }
    
    throw new Error('All LLM providers failed');
}

// OpenAI API call (requires API key)
async function callOpenAI(systemPrompt, userPrompt) {
    if (!llmSettings.openaiKey) {
        throw new Error('OpenAI API key not found');
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${llmSettings.openaiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: llmSettings.maxTokens,
            temperature: llmSettings.temperature
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content;
}

// OpenRouter API call (requires API key)
async function callOpenRouter(systemPrompt, userPrompt) {
    if (!llmSettings.openrouterKey) {
        throw new Error('OpenRouter API key not found');
    }
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${llmSettings.openrouterKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'AI Prompt Generator'
        },
        body: JSON.stringify({
            model: llmSettings.openrouterModel,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: llmSettings.maxTokens,
            temperature: llmSettings.temperature
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content;
}

// Ollama local API call
async function callOllama(systemPrompt, userPrompt) {
    const response = await fetch(`${llmSettings.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: llmSettings.ollamaModel,
            prompt: `${systemPrompt}\n\n${userPrompt}`,
            stream: false,
            options: {
                temperature: llmSettings.temperature,
                num_predict: llmSettings.maxTokens
            }
        })
    });
    
    if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} - Make sure Ollama is running`);
    }
    
    const data = await response.json();
    return data.response;
}

// Local LLM API call (generic endpoint)
async function callLocalLLM(systemPrompt, userPrompt) {
    // This can be adapted for any local LLM API
    const response = await fetch(`${llmSettings.localUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: llmSettings.maxTokens,
            temperature: llmSettings.temperature
        })
    });
    
    if (!response.ok) {
        throw new Error(`Local LLM API error: ${response.status} - Check if your local LLM server is running`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content;
}

// Fallback basic prompt generation
function generateBasicPrompt(selections) {
    const { type, objects, actions, angles, environments, visualElements, styles, proportions, other } = selections;
    const elements = [];
    
    if (objects) elements.push(objects);
    if (actions) elements.push(actions);
    if (environments) elements.push(`in ${environments}`);
    if (angles) elements.push(`${angles} shot`);
    if (visualElements) elements.push(`with ${visualElements}`);
    if (styles) elements.push(`${styles} style`);
    if (proportions) elements.push(`${proportions} aspect ratio`);
    if (other) elements.push(other);
    
    let prompt = elements.join(', ');
    
    // Add quality enhancers based on type
    if (type === 'video') {
        prompt += ', high quality, smooth motion, professional cinematography';
    } else {
        prompt += ', high resolution, sharp focus, professional photography, detailed';
    }
    
    return prompt;
}

// Get value from dropdown or custom input
function getFieldValue(fieldId) {
    const select = document.getElementById(fieldId);
    const selectedValue = select.value;
    if (selectedValue === 'custom') {
        const customInput = document.getElementById(`${fieldId}-custom`);
        return customInput.value.trim() || '';
    }
    return selectedValue || '';
}

// Display generated prompt
function displayPrompt(prompt) {
    promptResult.textContent = prompt;
    promptResult.classList.remove('empty');
    
    // Scroll to result
    promptResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Add a subtle animation
    promptResult.style.transform = 'scale(0.98)';
    setTimeout(() => {
        promptResult.style.transform = 'scale(1)';
    }, 100);
}

// Clear all form fields
function clearAllFields() {
    const prefix = currentTab;
    
    // Clear all selects
    document.querySelectorAll(`#${prefix}-tab .form-select`).forEach(select => {
        select.value = '';
    });
    
    // Clear all custom inputs
    document.querySelectorAll(`#${prefix}-tab .form-input`).forEach(input => {
        input.value = '';
        input.style.display = 'none';
    });
    
    // Clear textarea
    const textarea = document.getElementById(`${prefix}-other`);
    if (textarea) {
        textarea.value = '';
    }
    
    // Clear result
    promptResult.textContent = 'Your generated prompt will appear here...';
    promptResult.classList.add('empty');
}

// Generate random prompt
function generateRandomPrompt() {
    const prefix = currentTab === 'video' ? 'video' : 'photo';
    const fields = ['objects', 'actions', 'angles', 'environments', 'elements', 'styles', 'proportions'];
    
    fields.forEach(field => {
        const select = document.getElementById(`${prefix}-${field}`);
        if (select) {
            const options = Array.from(select.options).filter(opt => opt.value && opt.value !== 'custom');
            if (options.length > 0) {
                const randomOption = options[Math.floor(Math.random() * options.length)];
                select.value = randomOption.value;
            }
            const customInput = document.getElementById(`${prefix}-${field}-custom`);
            if (customInput) customInput.value = '';
        }
    });
    
    const otherInput = document.getElementById(`${prefix}-other`);
    if (otherInput) otherInput.value = '';
    
    generatePrompt();
}

// Copy prompt to clipboard
async function copyPrompt() {
    const text = promptResult.textContent;
    
    if (text === 'Your generated prompt will appear here...' || text === 'Please select some options to generate a prompt!') {
        showNotification('Please generate a prompt first!', 'warning');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Prompt copied to clipboard!', 'success');
        
        // Visual feedback
        copyBtn.classList.add('copied');
        setTimeout(() => {
            copyBtn.classList.remove('copied');
        }, 600);
        
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        showNotification('Prompt copied to clipboard!', 'success');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '1000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = '#10b981';
            break;
        case 'warning':
            notification.style.background = '#f59e0b';
            break;
        case 'error':
            notification.style.background = '#ef4444';
            break;
        default:
            notification.style.background = '#6366f1';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Add some keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        generatePrompt();
    }
    
    // Ctrl/Cmd + R for random (prevent page refresh)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        generateRandomPrompt();
    }
    
    // Ctrl/Cmd + C when prompt is focused
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === promptResult) {
        e.preventDefault();
        copyPrompt();
    }
});

// Add loading states for better UX
function addLoadingState(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    button.disabled = true;
    
    return function removeLoadingState() {
        button.innerHTML = originalText;
        button.disabled = false;
    };
}

// Enhanced generate function with loading state
const originalGeneratePrompt = generatePrompt;
generatePrompt = function() {
    const removeLoading = addLoadingState(generateBtn);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
        originalGeneratePrompt();
        removeLoading();
    }, 300);
};

// Add tooltips for better user experience
function addTooltips() {
    const tooltips = {
        'video-objects': 'Choose the main subject or object in your video',
        'video-actions': 'What action or movement should be happening',
        'video-angles': 'Camera angle and movement for the shot',
        'video-environments': 'Where the scene takes place',
        'video-elements': 'Visual effects and lighting conditions',
        'video-styles': 'Overall aesthetic and genre of the video',
        'photo-objects': 'The main subject or focus of your photo',
        'photo-actions': 'Pose or action of the subject',
        'photo-angles': 'Camera angle and framing',
        'photo-environments': 'Location or background setting',
        'photo-elements': 'Lighting setup and visual effects',
        'photo-styles': 'Photography style and aesthetic'
    };
    
    Object.entries(tooltips).forEach(([id, tooltip]) => {
        const element = document.getElementById(id);
        if (element) {
            element.title = tooltip;
        }
    });
}

// Initialize tooltips
document.addEventListener('DOMContentLoaded', addTooltips);

// Save user preferences to localStorage
function savePreferences() {
    const preferences = {
        currentTab: currentTab,
        lastPrompt: promptResult.textContent
    };
    localStorage.setItem('promptGeneratorPrefs', JSON.stringify(preferences));
}

// Load user preferences from localStorage
function loadPreferences() {
    const saved = localStorage.getItem('promptGeneratorPrefs');
    if (saved) {
        try {
            const preferences = JSON.parse(saved);
            if (preferences.currentTab && preferences.currentTab !== currentTab) {
                switchTab(preferences.currentTab);
            }
        } catch (e) {
            console.log('Could not load preferences');
        }
    }
}

// Auto-save preferences when tab changes or prompt is generated
window.addEventListener('beforeunload', savePreferences);
document.addEventListener('DOMContentLoaded', loadPreferences);

// Settings Modal Functions
function initializeSettings() {
    // Initialize sliders
    const temperatureSlider = document.getElementById('temperature');
    const maxTokensSlider = document.getElementById('max-tokens');
    const temperatureValue = document.getElementById('temperature-value');
    const maxTokensValue = document.getElementById('max-tokens-value');
    
    temperatureSlider.addEventListener('input', (e) => {
        temperatureValue.textContent = e.target.value;
        llmSettings.temperature = parseFloat(e.target.value);
    });
    
    maxTokensSlider.addEventListener('input', (e) => {
        maxTokensValue.textContent = e.target.value;
        llmSettings.maxTokens = parseInt(e.target.value);
    });
    
    // Provider selection
    const providerSelect = document.getElementById('llm-provider');
    providerSelect.addEventListener('change', (e) => {
        updateProviderSettings(e.target.value);
    });
}

function openSettings() {
    settingsModal.classList.add('active');
    loadSettingsToUI();
}

function closeSettings() {
    settingsModal.classList.remove('active');
}

function updateProviderSettings(provider) {
    const openaiSettings = document.getElementById('openai-settings');
    const openrouterSettings = document.getElementById('openrouter-settings');
    const ollamaSettings = document.getElementById('ollama-settings');
    const localSettings = document.getElementById('local-settings');
    
    // Hide all provider-specific settings
    openaiSettings.classList.add('hidden');
    openrouterSettings.classList.add('hidden');
    ollamaSettings.classList.add('hidden');
    localSettings.classList.add('hidden');
    
    // Show relevant settings based on provider
    switch (provider) {
        case 'openai':
        case 'auto':
            openaiSettings.classList.remove('hidden');
            if (provider === 'auto') {
                openrouterSettings.classList.remove('hidden');
                ollamaSettings.classList.remove('hidden');
                localSettings.classList.remove('hidden');
            }
            break;
        case 'openrouter':
            openrouterSettings.classList.remove('hidden');
            break;
        case 'ollama':
            ollamaSettings.classList.remove('hidden');
            break;
        case 'local':
            localSettings.classList.remove('hidden');
            break;
    }
}

function loadSettingsToUI() {
    document.getElementById('llm-provider').value = llmSettings.provider;
    document.getElementById('openai-key').value = llmSettings.openaiKey;
    document.getElementById('openrouter-key').value = llmSettings.openrouterKey;
    document.getElementById('openrouter-model').value = llmSettings.openrouterModel;
    document.getElementById('ollama-url').value = llmSettings.ollamaUrl;
    document.getElementById('ollama-model').value = llmSettings.ollamaModel;
    document.getElementById('local-url').value = llmSettings.localUrl;
    document.getElementById('temperature').value = llmSettings.temperature;
    document.getElementById('max-tokens').value = llmSettings.maxTokens;
    document.getElementById('temperature-value').textContent = llmSettings.temperature;
    document.getElementById('max-tokens-value').textContent = llmSettings.maxTokens;
    
    updateProviderSettings(llmSettings.provider);
}

function saveSettings() {
    llmSettings.provider = document.getElementById('llm-provider').value;
    llmSettings.openaiKey = document.getElementById('openai-key').value;
    llmSettings.openrouterKey = document.getElementById('openrouter-key').value;
    llmSettings.openrouterModel = document.getElementById('openrouter-model').value;
    llmSettings.ollamaUrl = document.getElementById('ollama-url').value;
    llmSettings.ollamaModel = document.getElementById('ollama-model').value;
    llmSettings.localUrl = document.getElementById('local-url').value;
    llmSettings.temperature = parseFloat(document.getElementById('temperature').value);
    llmSettings.maxTokens = parseInt(document.getElementById('max-tokens').value);
    
    // Save to localStorage
    localStorage.setItem('llmSettings', JSON.stringify(llmSettings));
    localStorage.setItem('openai_api_key', llmSettings.openaiKey);
    localStorage.setItem('openrouter_api_key', llmSettings.openrouterKey);
    
    showNotification('Settings saved successfully!', 'success');
    closeSettings();
}

function loadSettings() {
    const saved = localStorage.getItem('llmSettings');
    if (saved) {
        try {
            llmSettings = { ...llmSettings, ...JSON.parse(saved) };
        } catch (e) {
            console.log('Could not load LLM settings');
        }
    }
    
    // Load API keys separately for security
    const savedOpenAIKey = localStorage.getItem('openai_api_key');
    if (savedOpenAIKey) {
        llmSettings.openaiKey = savedOpenAIKey;
    }
    
    const savedOpenRouterKey = localStorage.getItem('openrouter_api_key');
    if (savedOpenRouterKey) {
        llmSettings.openrouterKey = savedOpenRouterKey;
    }
}

async function testLLMConnection() {
    const testBtn = testLLMBtn;
    const originalText = testBtn.innerHTML;
    
    testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
    testBtn.disabled = true;
    
    try {
        const testPrompt = 'Test connection';
        const systemPrompt = 'You are a helpful assistant. Respond with "Connection successful!"';
        
        let result = null;
        
        switch (llmSettings.provider) {
            case 'openai':
                result = await callOpenAI(systemPrompt, testPrompt);
                break;
            case 'openrouter':
                result = await callOpenRouter(systemPrompt, testPrompt);
                break;
            case 'ollama':
                result = await callOllama(systemPrompt, testPrompt);
                break;
            case 'local':
                result = await callLocalLLM(systemPrompt, testPrompt);
                break;
            case 'auto':
                // Try all providers
                const providers = [
                    () => callOpenAI(systemPrompt, testPrompt),
                    () => callOpenRouter(systemPrompt, testPrompt),
                    () => callOllama(systemPrompt, testPrompt),
                    () => callLocalLLM(systemPrompt, testPrompt)
                ];
                
                for (const provider of providers) {
                    try {
                        result = await provider();
                        if (result) break;
                    } catch (e) {
                        console.log('Provider test failed:', e.message);
                    }
                }
                break;
            default:
                throw new Error('No LLM provider selected');
        }
        
        if (result) {
            showNotification('✅ LLM connection successful!', 'success');
        } else {
            throw new Error('No response received');
        }
        
    } catch (error) {
        console.error('LLM test failed:', error);
        showNotification(`❌ Connection failed: ${error.message}`, 'error');
    } finally {
        testBtn.innerHTML = originalText;
        testBtn.disabled = false;
    }
}

// Language Functions
function initializeLanguage() {
    const languageSelect = document.getElementById('language-select');
    
    // Load saved language or default to English
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    currentLanguage = savedLanguage;
    languageSelect.value = savedLanguage;
    
    // Apply initial language
    updateLanguage(savedLanguage);
    
    // Add event listener for language changes
    languageSelect.addEventListener('change', (e) => {
        const newLanguage = e.target.value;
        currentLanguage = newLanguage;
        localStorage.setItem('selectedLanguage', newLanguage);
        updateLanguage(newLanguage);
    });
}

function updateLanguage(language) {
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[language] && translations[language][key]) {
            element.textContent = translations[language][key];
        }
    });
    
    // Update dropdown options
    updateDropdownOptions(language);
    
    // Update button texts
    updateButtonTexts(language);
    
    // Update placeholders
    updatePlaceholders(language);
}

function updateDropdownOptions(language) {
    const dropdowns = {
        'video-objects': {
            en: [
                { value: '', text: 'Select Objects/Protagonist' },
                { value: 'person', text: 'Person' },
                { value: 'animal', text: 'Animal' },
                { value: 'car', text: 'Car' },
                { value: 'robot', text: 'Robot' },
                { value: 'spaceship', text: 'Spaceship' },
                { value: 'custom', text: 'Custom' }
            ],
            'zh-TW': [
                { value: '', text: '選擇物件/主角' },
                { value: 'person', text: '人物' },
                { value: 'animal', text: '動物' },
                { value: 'car', text: '汽車' },
                { value: 'robot', text: '機器人' },
                { value: 'spaceship', text: '太空船' },
                { value: 'custom', text: '自訂' }
            ]
        },
        'video-actions': {
            en: [
                { value: '', text: 'Select Action' },
                { value: 'walking', text: 'Walking' },
                { value: 'running', text: 'Running' },
                { value: 'dancing', text: 'Dancing' },
                { value: 'custom', text: 'Custom' }
            ],
            'zh-TW': [
                { value: '', text: '選擇動作' },
                { value: 'walking', text: '行走' },
                { value: 'running', text: '跑步' },
                { value: 'dancing', text: '跳舞' },
                { value: 'custom', text: '自訂' }
            ]
        }
        // Add more dropdown translations as needed
    };
    
    Object.keys(dropdowns).forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown && dropdowns[dropdownId][language]) {
            const currentValue = dropdown.value;
            dropdown.innerHTML = '';
            
            dropdowns[dropdownId][language].forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text;
                dropdown.appendChild(optionElement);
            });
            
            dropdown.value = currentValue;
        }
    });
}

function updateButtonTexts(language) {
    const buttons = {
        'generate-btn': translations[language]['generate-btn'],
        'clear-btn': translations[language]['clear-btn'],
        'random-btn': translations[language]['random-btn'],
        'copy-btn': translations[language]['copy-btn'],
        'settings-btn': translations[language]['settings-btn']
    };
    
    Object.keys(buttons).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            // Preserve icons and update text
            const icon = button.querySelector('i');
            if (icon) {
                button.innerHTML = icon.outerHTML + ' ' + buttons[buttonId];
            } else {
                button.textContent = buttons[buttonId];
            }
        }
    });
}

function updatePlaceholders(language) {
    const promptResult = document.getElementById('prompt-result');
    if (promptResult && promptResult.classList.contains('empty')) {
        promptResult.textContent = translations[language]['prompt-placeholder'];
    }
    
    // Update custom input placeholders
    const customInputs = document.querySelectorAll('.custom-input');
    customInputs.forEach(input => {
        const id = input.id;
        if (id.includes('objects')) {
            input.placeholder = language === 'zh-TW' ? '輸入自訂物件/主角' : 'Enter custom object/protagonist';
        } else if (id.includes('actions')) {
            input.placeholder = language === 'zh-TW' ? '輸入自訂動作' : 'Enter custom action';
        } else if (id.includes('angles')) {
            input.placeholder = language === 'zh-TW' ? '輸入自訂攝影角度' : 'Enter custom camera angle';
        } else if (id.includes('environments')) {
            input.placeholder = language === 'zh-TW' ? '輸入自訂環境' : 'Enter custom environment';
        } else if (id.includes('elements')) {
            input.placeholder = language === 'zh-TW' ? '輸入自訂視覺元素' : 'Enter custom visual element';
        } else if (id.includes('styles')) {
            input.placeholder = language === 'zh-TW' ? '輸入自訂風格' : 'Enter custom style';
        } else if (id.includes('proportions')) {
            input.placeholder = language === 'zh-TW' ? '輸入自訂長寬比' : 'Enter custom aspect ratio';
        }
    });
}
