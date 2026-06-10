// Global State & UI Elements
const animatedElements = document.querySelectorAll('.animate-up');
const mobileToggle = document.querySelector('.mobile-menu-toggle');
const nav = document.querySelector('.site-nav');

// Intersection Observer for scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15,
});

animatedElements.forEach((element) => observer.observe(element));

// Mobile menu toggle
mobileToggle?.addEventListener('click', () => {
    nav?.classList.toggle('nav-open');
    mobileToggle.classList.toggle('open');
});

// Modal System
const modals = {
    login: document.getElementById('login-modal'),
    signup: document.getElementById('signup-modal'),
    addLead: document.getElementById('add-lead-modal')
};

// Open modal function
function openModal(name) {
    if (modals[name]) {
        modals[name].classList.add('active');
    }
}

// Close modal function
function closeModal(modalEl) {
    modalEl.classList.remove('active');
}

// Setup static modals actions
document.body.addEventListener('click', (e) => {
    // Open modal via data-modal buttons
    const trigger = e.target.closest('[data-modal]');
    if (trigger && !trigger.closest('.header-actions')) { // Skip header action triggers if handled separately
        e.preventDefault();
        const modalName = trigger.getAttribute('data-modal');
        openModal(modalName);
    }
    
    // Close modal
    if (e.target.closest('.modal-close')) {
        e.preventDefault();
        const modal = e.target.closest('.modal');
        if (modal) closeModal(modal);
    }
    
    // Close modal on backdrop click
    if (e.target.classList.contains('modal-backdrop')) {
        const modal = e.target.closest('.modal');
        if (modal) closeModal(modal);
    }
    
    // Switch between forms
    if (e.target.classList.contains('link-switch-form')) {
        e.preventDefault();
        const targetModal = e.target.getAttribute('data-modal');
        const currentModal = e.target.closest('.modal');
        if (currentModal) closeModal(currentModal);
        setTimeout(() => openModal(targetModal), 250);
    }
});

// Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span style="font-size: 1.1rem; line-height: 1;">${type === 'success' ? '✓' : 'ℹ'}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// ----------------------------------------------------
// Connected Authentication & LocalStorage State
// ----------------------------------------------------
function updateAuthState() {
    const headerActions = document.getElementById('header-actions');
    if (!headerActions) return;
    
    const loggedInUser = localStorage.getItem('nexa_user');
    
    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        const avatarLetter = user.name ? user.name[0].toUpperCase() : 'U';
        
        headerActions.innerHTML = `
            <div class="header-profile-menu">
                <div class="header-profile-avatar" title="${user.name} (${user.email})">${avatarLetter}</div>
                <button class="button button-primary" id="header-go-to-app" style="padding: 10px 20px; font-size: 0.9rem;">Go to App</button>
                <button class="link-secondary" id="header-logout" style="border: none; background: none; cursor: pointer; font: inherit; font-size: 0.9rem;">Logout</button>
            </div>
        `;
        
        // Re-attach listeners for dynamically generated header actions
        document.getElementById('header-go-to-app').addEventListener('click', openAppOverlay);
        document.getElementById('header-logout').addEventListener('click', handleLogout);
    } else {
        headerActions.innerHTML = `
            <button class="link-secondary" id="header-login-btn" style="border: none; background: none; cursor: pointer; font: inherit;">Login</button>
            <button class="button button-primary" id="header-signup-btn">Start Free Trial</button>
        `;
        
        document.getElementById('header-login-btn').addEventListener('click', () => openModal('login'));
        document.getElementById('header-signup-btn').addEventListener('click', () => openModal('signup'));
    }
}

// Login/Signup form handlers
document.querySelectorAll('.modal-form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const modal = form.closest('.modal');
        
        if (modal.id === 'login-modal') {
            const email = form.querySelector('#login-email')?.value || 'user@company.com';
            const name = email.split('@')[0];
            const user = { name: name.charAt(0).toUpperCase() + name.slice(1), email: email, company: 'NexaCorp' };
            
            localStorage.setItem('nexa_user', JSON.stringify(user));
            closeModal(modal);
            updateAuthState();
            showToast(`Welcome back, ${user.name}! Successfully logged in.`, 'success');
        } else if (modal.id === 'signup-modal') {
            const name = form.querySelector('#signup-name')?.value || 'John Doe';
            const email = form.querySelector('#signup-email')?.value || 'john@company.com';
            const company = form.querySelector('#signup-company')?.value || 'Acme Corp';
            const user = { name, email, company };
            
            localStorage.setItem('nexa_user', JSON.stringify(user));
            closeModal(modal);
            updateAuthState();
            showToast(`Registration complete! Welcome to NexaCRM, ${name}.`, 'success');
        }
    });
});

function handleLogout() {
    localStorage.removeItem('nexa_user');
    updateAuthState();
    showToast("Logged out successfully.", "info");
}

// ----------------------------------------------------
// Interactive Hero Dashboard Chart
// ----------------------------------------------------
const heroCardLeads = document.getElementById('hero-card-leads');
const heroCardDeals = document.getElementById('hero-card-deals');
const heroChartTitle = document.getElementById('hero-chart-title');
const heroChartGraph = document.getElementById('hero-chart-graph');

const chartData = {
    leads: {
        title: "Q2 Performance (New Leads)",
        heights: ["45%", "68%", "55%", "82%", "72%"]
    },
    deals: {
        title: "Q2 Performance (Open Deals)",
        heights: ["22%", "48%", "35%", "60%", "45%"]
    }
};

function updateHeroChart(metric) {
    if (!heroChartGraph || !heroChartTitle) return;
    
    const data = chartData[metric];
    heroChartTitle.textContent = data.title;
    
    const bars = heroChartGraph.querySelectorAll('span');
    bars.forEach((bar, idx) => {
        bar.style.transition = 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        bar.style.height = data.heights[idx];
    });
}

heroCardLeads?.addEventListener('click', () => {
    heroCardLeads.classList.add('active');
    heroCardDeals?.classList.remove('active');
    updateHeroChart('leads');
});

heroCardDeals?.addEventListener('click', () => {
    heroCardDeals.classList.add('active');
    heroCardLeads?.classList.remove('active');
    updateHeroChart('deals');
});

// Initialize hero chart heights with animation
setTimeout(() => {
    updateHeroChart('leads');
}, 500);

// ----------------------------------------------------
// Interactive Solutions tab switcher
// ----------------------------------------------------
const solutionsData = {
    sales: {
        heading: "Scale faster with the CRM tools your team actually uses.",
        desc: "Connect sales, marketing, and service with automated workflows, intelligent forecasting, and one unified customer view.",
        features: [
            "End-to-end visibility for every opportunity",
            "Rule-based automation that keeps your team moving",
            "Real-time performance insights across every pipeline"
        ],
        stats: [
            { val: "250,000+", label: "Users" },
            { val: "180+", label: "Countries" },
            { val: "40%", label: "Productivity Increase" },
            { val: "99.9%", label: "Uptime" }
        ]
    },
    marketing: {
        heading: "Nurture relationships at scale with smart campaign tools.",
        desc: "Create personalized multi-channel marketing campaigns, track conversion sources, and automate your lead routing systems.",
        features: [
            "Visual campaign builder for targeted email runs",
            "Automatic lead scoring based on site activity",
            "Detailed source tracking for accurate ROI calculations"
        ],
        stats: [
            { val: "1.2B+", label: "Emails Sent" },
            { val: "150%+", label: "Average Campaign ROI" },
            { val: "35%", label: "Conversion Lift" },
            { val: "24/7", label: "Automated Triggers" }
        ]
    },
    support: {
        heading: "Resolve customer concerns faster and boost retention.",
        desc: "Equip your service representatives with full context on every client, automated ticket management, and shared customer records.",
        features: [
            "Unified account views showing both sales history and service tickets",
            "SLA-based routing to automatically escalate delayed resolutions",
            "Instant knowledge base integration to reply faster"
        ],
        stats: [
            { val: "98.6%", label: "CSAT Score" },
            { val: "12m", label: "Average Response Time" },
            { val: "60%", label: "Ticket Resolution Rate" },
            { val: "99.9%", label: "SLA Adherence" }
        ]
    }
};

document.querySelectorAll('.sol-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Toggle active
        document.querySelectorAll('.sol-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const type = tab.getAttribute('data-sol');
        const data = solutionsData[type];
        if (!data) return;
        
        // Update content
        const heading = document.getElementById('solutions-subheading');
        const desc = document.getElementById('solutions-desc');
        const list = document.getElementById('solutions-list');
        const stats = document.getElementById('solutions-stats-grid');
        
        if (heading) heading.textContent = data.heading;
        if (desc) desc.textContent = data.desc;
        
        if (list) {
            list.innerHTML = data.features.map(f => `<li>${f}</li>`).join('');
        }
        
        if (stats) {
            stats.innerHTML = data.stats.map(s => `
                <div class="stat-card" style="animation: fadeInUp 0.3s ease;">
                    <strong>${s.val}</strong>
                    <span>${s.label}</span>
                </div>
            `).join('');
        }
    });
});

// ----------------------------------------------------
// Interactive Demo showcase tabs
// ----------------------------------------------------
const demoMockups = {
    pipeline: `
        <div class="screen-body pipeline-view" style="animation: fadeIn 0.4s ease;">
            <div class="screen-row">
                <div class="screen-card mini-kanban-col">
                    <h5>Leads</h5>
                    <div class="mini-card">Acme Corp <span>$12k</span></div>
                    <div class="mini-card">Globex Ltd <span>$8k</span></div>
                </div>
                <div class="screen-card mini-kanban-col">
                    <h5>Proposal</h5>
                    <div class="mini-card">Initech <span>$15k</span></div>
                </div>
            </div>
        </div>
    `,
    automation: `
        <div class="screen-body" style="animation: fadeIn 0.4s ease;">
            <div class="automation-flow">
                <div class="flow-node trigger">⚡ Lead Created in NexaCRM</div>
                <div class="flow-connector"></div>
                <div class="flow-node action">✉ Send Welcome Email Campaign</div>
                <div class="flow-connector"></div>
                <div class="flow-node action">👤 Assign Owner: Amanda Lee</div>
            </div>
        </div>
    `,
    analytics: `
        <div class="screen-body" style="animation: fadeIn 0.4s ease;">
            <div class="analytics-mock">
                <div class="donut-chart-container">
                    <svg width="120" height="120" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#e2e8f0" stroke-width="4"></circle>
                        <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="var(--primary)" stroke-width="4" stroke-dasharray="65 35" stroke-dashoffset="25"></circle>
                        <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="var(--secondary)" stroke-width="4" stroke-dasharray="20 80" stroke-dashoffset="90"></circle>
                    </svg>
                    <div class="donut-chart-text">
                        <strong>+45%</strong>
                        <span>Growth</span>
                    </div>
                </div>
                <div class="analytics-legend">
                    <div class="legend-item"><span class="legend-dot" style="background: var(--primary);"></span> Direct Sales</div>
                    <div class="legend-item"><span class="legend-dot" style="background: var(--secondary);"></span> Email Marketing</div>
                </div>
            </div>
        </div>
    `,
    collaboration: `
        <div class="screen-body" style="animation: fadeIn 0.4s ease;">
            <div class="collaboration-feed">
                <div class="feed-item">
                    <div class="avatar" style="background: var(--primary);">A</div>
                    <div class="feed-details">
                        <strong>Amanda Lee</strong>
                        <span>Moved deal <b>Acme Corp</b> to Proposal Stage</span>
                    </div>
                </div>
                <div class="feed-item">
                    <div class="avatar" style="background: var(--secondary);">J</div>
                    <div class="feed-details">
                        <strong>Jared Coleman</strong>
                        <span>Attached file <b>proposal-v2.pdf</b> to Orbit Tech</span>
                    </div>
                </div>
            </div>
        </div>
    `
};

document.querySelectorAll('.demo-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.demo-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const type = tab.getAttribute('data-demo');
        const container = document.getElementById('demo-visual-container');
        if (container && demoMockups[type]) {
            container.innerHTML = demoMockups[type];
        }
    });
});

// ----------------------------------------------------
// ScrollSpy & Sticky Header Styling
// ----------------------------------------------------
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.site-nav a');

window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 120;
    
    // Header shadow/blur state toggler
    const header = document.querySelector('.site-header');
    if (window.scrollY > 20) {
        header?.classList.add('scrolled');
    } else {
        header?.classList.remove('scrolled');
    }
    
    // ScrollSpy active link
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        
        if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// ----------------------------------------------------
// Scroll to Top & Scroll Progress Ring
// ----------------------------------------------------
const scrollTopBtn = document.getElementById('scroll-to-top');
const progressCircle = document.querySelector('.progress-ring__circle');

if (progressCircle) {
    const radius = progressCircle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTop / docHeight;
        
        // Toggle button visibility
        if (scrollTop > 300) {
            scrollTopBtn?.classList.add('visible');
        } else {
            scrollTopBtn?.classList.remove('visible');
        }
        
        // Update circular ring progress
        const offset = circumference - (scrollPercent * circumference);
        progressCircle.style.strokeDashoffset = offset;
    });
    
    scrollTopBtn?.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ----------------------------------------------------
// Full Screen Mock CRM App Logic
// ----------------------------------------------------
const appOverlay = document.getElementById('app-overlay');
const closeAppBtn = document.getElementById('close-app-btn');

// Initial default pipeline data
const defaultLeads = [
    { id: 1, name: "Acme Corp", contact: "Jane Doe", value: 12000, status: "qualified", priority: "high" },
    { id: 2, name: "Globex Ltd", contact: "Mark Johnson", value: 8000, status: "qualified", priority: "low" },
    { id: 3, name: "Initech LLC", contact: "Peter Gibbons", value: 15000, status: "proposal", priority: "medium" },
    { id: 4, name: "Hooli Inc", contact: "Gavin Belson", value: 45000, status: "contacted", priority: "high" },
    { id: 5, name: "Veep Group", contact: "Selina Meyer", value: 30000, status: "won", priority: "medium" }
];

function getLeads() {
    const leads = localStorage.getItem('nexa_leads');
    if (!leads) {
        localStorage.setItem('nexa_leads', JSON.stringify(defaultLeads));
        return defaultLeads;
    }
    return JSON.parse(leads);
}

function saveLeads(leads) {
    localStorage.setItem('nexa_leads', JSON.stringify(leads));
}

// Selection state
const selectedLeadIds = new Set();

function bindCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.lead-select-checkbox');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            const leadId = Number(cb.dataset.leadId);
            const card = cb.closest('.pipeline-item');
            if (cb.checked) {
                selectedLeadIds.add(leadId);
                card?.classList.add('selected');
            } else {
                selectedLeadIds.delete(leadId);
                card?.classList.remove('selected');
            }
            updateBatchActionsBar();
        });
    });
}

function updateBatchActionsBar() {
    const bar = document.getElementById('batch-actions-bar');
    const countEl = document.getElementById('batch-selected-count');
    if (!bar || !countEl) return;
    
    const count = selectedLeadIds.size;
    countEl.textContent = count;
    
    if (count > 0) {
        bar.classList.add('active');
    } else {
        bar.classList.remove('active');
        // Hide dropdown if open
        const dropdownMenu = document.getElementById('batch-stage-dropdown-menu');
        if (dropdownMenu) dropdownMenu.classList.remove('show');
    }
}

function clearSelection() {
    selectedLeadIds.clear();
    const checkboxes = document.querySelectorAll('.lead-select-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
    document.querySelectorAll('.pipeline-item.selected').forEach(card => card.classList.remove('selected'));
    updateBatchActionsBar();
}

function setupBatchActions() {
    const dropdownBtn = document.getElementById('batch-stage-dropdown-btn');
    const dropdownMenu = document.getElementById('batch-stage-dropdown-menu');
    const priorityBtn = document.getElementById('batch-priority-dropdown-btn');
    const priorityMenu = document.getElementById('batch-priority-dropdown-menu');
    const valIncreaseBtn = document.getElementById('batch-val-increase-btn');
    const valDecreaseBtn = document.getElementById('batch-val-decrease-btn');
    const deleteBtn = document.getElementById('batch-delete-btn');
    const clearBtn = document.getElementById('batch-clear-btn');
    
    // Toggle dropdown
    dropdownBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu?.classList.toggle('show');
        priorityMenu?.classList.remove('show');
    });

    // Toggle priority dropdown
    priorityBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        priorityMenu?.classList.toggle('show');
        dropdownMenu?.classList.remove('show');
    });
    
    // Close dropdown on click outside
    document.addEventListener('click', () => {
        dropdownMenu?.classList.remove('show');
        priorityMenu?.classList.remove('show');
    });
    
    // Batch Move to Stage
    document.querySelectorAll('.batch-stage-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            const stage = opt.dataset.stage;
            let leads = getLeads();
            let count = 0;
            
            leads = leads.map(lead => {
                if (selectedLeadIds.has(lead.id)) {
                    lead.status = stage;
                    count++;
                }
                return lead;
            });
            
            saveLeads(leads);
            clearSelection();
            renderPipelineBoard();
            showToast(`Successfully moved ${count} leads to stage "${stage.toUpperCase()}".`, 'success');
        });
    });

    // Batch Change Priority
    document.querySelectorAll('.batch-priority-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            const priority = opt.dataset.priority;
            let leads = getLeads();
            let count = 0;
            
            leads = leads.map(lead => {
                if (selectedLeadIds.has(lead.id)) {
                    lead.priority = priority;
                    count++;
                }
                return lead;
            });
            
            saveLeads(leads);
            clearSelection();
            renderPipelineBoard();
            showToast(`Successfully updated priority of ${count} leads to "${priority.toUpperCase()}".`, 'success');
        });
    });
    
    // Batch Increase Value (+10%)
    valIncreaseBtn?.addEventListener('click', () => {
        let leads = getLeads();
        let count = 0;
        
        leads = leads.map(lead => {
            if (selectedLeadIds.has(lead.id)) {
                lead.value = Math.round(Number(lead.value) * 1.1);
                count++;
            }
            return lead;
        });
        
        saveLeads(leads);
        clearSelection();
        renderPipelineBoard();
        showToast(`Successfully increased deal value of ${count} leads by 10%.`, 'success');
    });

    // Batch Decrease Value (-10%)
    valDecreaseBtn?.addEventListener('click', () => {
        let leads = getLeads();
        let count = 0;
        
        leads = leads.map(lead => {
            if (selectedLeadIds.has(lead.id)) {
                lead.value = Math.round(Number(lead.value) * 0.9);
                count++;
            }
            return lead;
        });
        
        saveLeads(leads);
        clearSelection();
        renderPipelineBoard();
        showToast(`Successfully applied -10% discount to ${count} leads.`, 'success');
    });
    
    // Batch Delete
    deleteBtn?.addEventListener('click', () => {
        let leads = getLeads();
        const initialCount = leads.length;
        
        leads = leads.filter(lead => !selectedLeadIds.has(lead.id));
        const deletedCount = initialCount - leads.length;
        
        saveLeads(leads);
        clearSelection();
        renderPipelineBoard();
        showToast(`Successfully deleted ${deletedCount} leads from the pipeline.`, 'info');
    });
    
    // Clear Selection
    clearBtn?.addEventListener('click', clearSelection);
}

function renderPipelineBoard() {
    const leads = getLeads();
    const cols = {
        qualified: document.getElementById('col-qualified'),
        contacted: document.getElementById('col-contacted'),
        proposal: document.getElementById('col-proposal'),
        won: document.getElementById('col-won')
    };
    
    // Clear lists
    Object.values(cols).forEach(col => {
        if (col) col.innerHTML = '';
    });
    
    let totalRevenueVal = 0;
    let activeDealsCount = 0;

    const colTotals = {
        qualified: { count: 0, value: 0 },
        contacted: { count: 0, value: 0 },
        proposal: { count: 0, value: 0 },
        won: { count: 0, value: 0 }
    };
    
    leads.forEach(lead => {
        const col = cols[lead.status];
        if (!col) return;
        
        const valueNum = Number(lead.value) || 0;
        totalRevenueVal += valueNum;
        if (lead.status === 'contacted' || lead.status === 'proposal') {
            activeDealsCount++;
        }

        if (colTotals[lead.status]) {
            colTotals[lead.status].count++;
            colTotals[lead.status].value += valueNum;
        }
        
        const card = document.createElement('div');
        const isSelected = selectedLeadIds.has(lead.id);
        
        card.className = `pipeline-item priority-${lead.priority || 'low'}`;
        if (isSelected) card.classList.add('selected');
        
        card.setAttribute('data-lead-id', lead.id);
        card.innerHTML = `
            <div class="pipeline-item-header">
                <label class="card-checkbox-container" onclick="event.stopPropagation();">
                    <input type="checkbox" class="lead-select-checkbox" data-lead-id="${lead.id}" ${isSelected ? 'checked' : ''} />
                    <span class="custom-checkbox"></span>
                </label>
                <span class="priority-badge ${lead.priority || 'low'}">${(lead.priority || 'low').toUpperCase()}</span>
            </div>
            <h5>${lead.name}</h5>
            <span class="contact-person">👤 ${lead.contact}</span>
            <div class="pipeline-item-footer">
                <span class="deal-val">$${valueNum.toLocaleString()}</span>
            </div>
        `;
        
        // Allow clicking the card (except checkbox) to toggle selection
        card.addEventListener('click', (e) => {
            if (e.target.closest('.card-checkbox-container')) return;
            const checkbox = card.querySelector('.lead-select-checkbox');
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        
        col.appendChild(card);
    });
    
    // Update summary metrics
    const revEl = document.getElementById('app-total-revenue');
    const leadsEl = document.getElementById('app-total-leads');
    const activeEl = document.getElementById('app-active-deals');
    
    if (revEl) revEl.textContent = `$${totalRevenueVal.toLocaleString()}`;
    if (leadsEl) leadsEl.textContent = leads.length.toLocaleString();
    if (activeEl) activeEl.textContent = activeDealsCount.toString();

    // Update column headers dynamically
    Object.keys(colTotals).forEach(status => {
        const badgeId = status === 'won' ? 'col-badge-won' : `col-badge-${status}`;
        const badgeEl = document.getElementById(badgeId);
        if (badgeEl) {
            const totalVal = colTotals[status].value;
            const valFormatted = totalVal >= 1000 
                ? (totalVal / 1000).toFixed(0) + 'k' 
                : totalVal;
            badgeEl.textContent = `${colTotals[status].count} ($${valFormatted})`;
        }
    });
    
    // Re-bind checkbox listeners
    bindCheckboxListeners();
}

function openAppOverlay(e) {
    if (e) e.preventDefault();
    
    // Make sure user is logged in
    const loggedInUser = localStorage.getItem('nexa_user');
    if (!loggedInUser) {
        openModal('signup');
        showToast("Please sign up or log in first to access the CRM App.", "info");
        return;
    }
    
    const user = JSON.parse(loggedInUser);
    
    // Set user info in app sidebar
    const nameEl = document.getElementById('app-user-name');
    const emailEl = document.getElementById('app-user-email');
    const avatarEl = document.getElementById('app-user-avatar');
    
    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;
    if (avatarEl) avatarEl.textContent = user.name[0].toUpperCase();
    
    // Render leads board
    renderPipelineBoard();
    
    // Show overlay
    appOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock main scroll
}

function closeAppOverlay() {
    clearSelection();
    appOverlay?.classList.remove('active');
    document.body.style.overflow = ''; // Unlock main scroll
}

closeAppBtn?.addEventListener('click', closeAppOverlay);
document.getElementById('goto-pipeline-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast("You are already viewing the Deals Pipeline board!", "info");
});

document.getElementById('goto-pipeline-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast("You are already on the workspace dashboard view.", "info");
});

// Add New Lead Flow inside the App
const addLeadBtn = document.getElementById('add-lead-btn');
const addLeadCloseBtn = document.getElementById('add-lead-close-btn');
const addLeadForm = document.getElementById('add-lead-form');

addLeadBtn?.addEventListener('click', () => openModal('addLead'));
addLeadCloseBtn?.addEventListener('click', () => closeModal(document.getElementById('add-lead-modal')));

addLeadForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('lead-name').value;
    const contact = document.getElementById('lead-contact').value;
    const value = document.getElementById('lead-value').value;
    const status = document.getElementById('lead-status').value;
    
    const priorityEl = document.querySelector('input[name="lead-priority"]:checked');
    const priority = priorityEl ? priorityEl.value : 'low';
    
    const leads = getLeads();
    const newLead = {
        id: Date.now(),
        name,
        contact,
        value: Number(value),
        status,
        priority
    };
    
    leads.push(newLead);
    saveLeads(leads);
    renderPipelineBoard();
    
    // Close modal and reset form
    closeModal(document.getElementById('add-lead-modal'));
    addLeadForm.reset();
    
    showToast(`Successfully added lead "${name}" to the pipeline!`, 'success');
});

// App Sidebar Logout
document.getElementById('app-logout-btn')?.addEventListener('click', () => {
    closeAppOverlay();
    handleLogout();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateAuthState();
    wpInit();
    setupBatchActions();
});

// ============================================================
// WORDPRESS SIMULATION SYSTEM
// ============================================================

// ---- Default WordPress Blog Posts Data ----
const wpDefaultPosts = [
    { id: 1, title: '5 CRM Strategies That Accelerate Growth', category: 'Tips', excerpt: 'Learn how leading sales teams use modern CRM practices to close deals faster and improve customer retention rates.', date: 'Jun 8, 2026', color: 'linear-gradient(135deg, #0066ff, #3b82f6)', author: 'admin' },
    { id: 2, title: 'How TechCorp Increased Sales by 45% in 6 Months', category: 'Case Study', excerpt: 'Discover how a mid-market SaaS company optimized their sales pipeline using NexaCRM automation tools.', date: 'Jun 5, 2026', color: 'linear-gradient(135deg, #00c875, #22c55e)', author: 'admin' },
    { id: 3, title: 'Introducing AI-Powered Lead Scoring', category: 'Product Update', excerpt: 'Our new machine learning feature automatically ranks leads by conversion probability, saving your team hours.', date: 'Jun 1, 2026', color: 'linear-gradient(135deg, #0b8cff, #56a4ff)', author: 'admin' },
    { id: 4, title: 'Connect Your Favorite Tools to NexaCRM', category: 'Integration', excerpt: 'Explore our new integrations with popular marketing and communication platforms for seamless workflows.', date: 'May 28, 2026', color: 'linear-gradient(135deg, #26b2a9, #1d9c8d)', author: 'admin' },
    { id: 5, title: 'Building a High-Performance Sales Team', category: 'Tips', excerpt: 'Best practices for hiring, onboarding, and managing remote sales teams in a modern CRM environment.', date: 'May 25, 2026', color: 'linear-gradient(135deg, #f59e0b, #fcd34d)', author: 'admin' },
    { id: 6, title: 'Live Demo: Advanced Pipeline Management', category: 'Webinar', excerpt: 'Join our product team for an exclusive walkthrough of NexaCRM\'s powerful deal tracking and forecasting tools.', date: 'May 20, 2026', color: 'linear-gradient(135deg, #ec4899, #f472b6)', author: 'admin' },
];

// ---- Default Plugins Data ----
const wpDefaultPlugins = [
    { id: 'elementor', name: 'Elementor Pro', version: '3.21.0', description: 'The most advanced frontend drag & drop page builder. Create high-end, pixel perfect websites at record speeds.', active: true },
    { id: 'yoast', name: 'Yoast SEO', version: '22.4', description: 'The first true all-in-one SEO solution for WordPress, including on-page content analysis, XML sitemaps and much more.', active: true },
    { id: 'woocommerce', name: 'WooCommerce', version: '8.9.1', description: 'An open-source eCommerce toolkit that helps you sell anything beautifully.', active: false },
    { id: 'akismet', name: 'Akismet Anti-Spam', version: '5.3.1', description: 'Used by millions, Akismet is quite possibly the best way in the world to protect your blog from spam.', active: true },
    { id: 'cf7', name: 'Contact Form 7', version: '5.9.5', description: 'Just another contact form plugin. Simple but flexible.', active: false },
];

// ---- Default WP Site Customizer Settings ----
const wpDefaultSettings = {
    siteTitle: 'NexaCRM',
    heroEyebrow: 'Modern CRM for Enterprise Growth',
    heroHeadline: 'Grow your business with a smarter CRM experience.',
    heroDesc: 'Manage leads, automate processes, and accelerate revenue with an enterprise-ready CRM platform built for high-performance teams.',
    heroBtnText: 'Start Free Trial',
    primaryColor: '#0066ff',
    themePreset: 'classic'
};

// ---- Storage Helpers ----
function wpGetPosts() {
    const stored = localStorage.getItem('wp_posts');
    return stored ? JSON.parse(stored) : [...wpDefaultPosts];
}

function wpSavePosts(posts) {
    localStorage.setItem('wp_posts', JSON.stringify(posts));
}

function wpGetPlugins() {
    const stored = localStorage.getItem('wp_plugins');
    return stored ? JSON.parse(stored) : [...wpDefaultPlugins];
}

function wpSavePlugins(plugins) {
    localStorage.setItem('wp_plugins', JSON.stringify(plugins));
}

function wpGetSettings() {
    const stored = localStorage.getItem('wp_settings');
    return stored ? JSON.parse(stored) : { ...wpDefaultSettings };
}

function wpSaveSettings(settings) {
    localStorage.setItem('wp_settings', JSON.stringify(settings));
}

function wpGetDrafts() {
    const stored = localStorage.getItem('wp_drafts');
    return stored ? JSON.parse(stored) : [];
}

function wpSaveDrafts(drafts) {
    localStorage.setItem('wp_drafts', JSON.stringify(drafts));
}

// ---- Apply Site Settings to Live Page ----
function wpApplySettings(settings) {
    // Brand Logo/Title
    document.querySelectorAll('.brand-logo').forEach(el => el.textContent = settings.siteTitle);
    document.querySelector('.app-logo') && (document.querySelector('.app-logo').textContent = settings.siteTitle);

    // Hero Eyebrow
    const eyebrow = document.querySelector('.hero-section .eyebrow');
    if (eyebrow) eyebrow.textContent = settings.heroEyebrow;

    // Hero H1
    const heroH1 = document.querySelector('.hero-section h1');
    if (heroH1) heroH1.textContent = settings.heroHeadline;

    // Hero description
    const heroP = document.querySelector('.hero-copy > p');
    if (heroP) heroP.textContent = settings.heroDesc;

    // CTA buttons text
    document.querySelectorAll('.button-primary[data-modal="signup"]').forEach(btn => {
        btn.textContent = settings.heroBtnText;
    });

    const presets = {
        classic: { primary: '#0066ff', secondary: '#00c875', grad: 'linear-gradient(135deg, #0066ff, #2d7dff)' },
        neon: { primary: '#00f0ff', secondary: '#ff007f', grad: 'linear-gradient(135deg, #00f0ff, #ff007f)' },
        sunset: { primary: '#ff5e3a', secondary: '#ff2a6d', grad: 'linear-gradient(135deg, #ff5e3a, #ff2a6d)' },
        emerald: { primary: '#059669', secondary: '#10b981', grad: 'linear-gradient(135deg, #059669, #10b981)' },
        royal: { primary: '#6366f1', secondary: '#a855f7', grad: 'linear-gradient(135deg, #6366f1, #a855f7)' }
    };

    const activePreset = presets[settings.themePreset || 'classic'];

    // Primary color CSS variable
    const primaryColor = settings.primaryColor || activePreset.primary;
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--primary-strong', primaryColor);
    document.documentElement.style.setProperty('--secondary', activePreset.secondary);

    const pGrad = settings.themePreset && settings.themePreset !== 'classic' 
        ? activePreset.grad 
        : `linear-gradient(135deg, ${primaryColor}, #2d7dff)`;
    document.documentElement.style.setProperty('--primary-gradient', pGrad);

    // Update document title
    document.title = `${settings.siteTitle} | Modern SaaS CRM Landing Page`;
}

// ---- Render Blog Posts on Landing Page ----
function wpRenderBlogPosts() {
    const posts = wpGetPosts();
    const grid = document.getElementById('blog-posts-grid');
    const recentList = document.getElementById('recent-posts-list');
    const activityList = document.getElementById('wp-activity-posts');
    const glanceCount = document.getElementById('wp-glance-posts-count');

    if (glanceCount) glanceCount.textContent = posts.length;

    if (grid) {
        const delays = ['', 'delay-1', 'delay-2', 'delay-3', 'delay-4', 'delay-4'];
        grid.innerHTML = posts.map((post, i) => `
            <article class="blog-post-card animate-up ${delays[i] || 'delay-4'}">
                <div class="post-image" style="background: ${post.color};"></div>
                <div class="post-content">
                    <div class="post-meta">
                        <span class="post-category">${post.category}</span>
                        <span class="post-date">${post.date}</span>
                    </div>
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <a href="#" class="post-read-more">${post.category === 'Webinar' ? 'Register' : 'Read More'} →</a>
                </div>
            </article>
        `).join('');

        // Re-observe newly rendered cards for animation
        grid.querySelectorAll('.animate-up').forEach(el => observer.observe(el));
    }

    if (recentList) {
        recentList.innerHTML = posts.slice(0, 4).map(post => `
            <li>
                <a href="#">${post.title.substring(0, 40)}${post.title.length > 40 ? '…' : ''}</a>
                <span class="post-date-small">${post.date.split(',')[0]}</span>
            </li>
        `).join('');
    }

    if (activityList) {
        activityList.innerHTML = posts.slice(0, 5).map(post => `
            <li>
                <a href="#">${post.title}</a>
                <span style="display:block; color:#8c8f94; font-size:11px;">${post.date} by ${post.author}</span>
            </li>
        `).join('');
    }
}

// ---- Render Posts Table in WP-Admin ----
function wpRenderPostsTable() {
    const posts = wpGetPosts();
    const tbody = document.getElementById('wp-posts-table-body');
    if (!tbody) return;
    tbody.innerHTML = posts.map(post => `
        <tr>
            <td>
                <strong>${post.title}</strong>
                <div class="row-actions" style="display:flex; gap: 10px; margin-top: 4px;">
                    <a href="#" class="wp-edit-post-btn" data-post-id="${post.id}" style="color:#2271b1; font-size:12px;">Edit</a>
                    <a href="#" class="wp-delete-post-btn" data-post-id="${post.id}" style="color:#d63638; font-size:12px;">Trash</a>
                    <a href="#" style="color:#2271b1; font-size:12px;">View</a>
                </div>
            </td>
            <td>${post.author}</td>
            <td><span style="background:#e8f4fc; color:#2271b1; padding:2px 8px; border-radius:12px; font-size:11px;">${post.category}</span></td>
            <td style="white-space:nowrap;">${post.date}</td>
            <td style="text-align:right;">
                <button class="wp-trash-post-icon-btn" data-post-id="${post.id}" title="Delete Post" style="background:none;border:none;cursor:pointer;color:#d63638;font-size:16px;">🗑</button>
            </td>
        </tr>
    `).join('');

    // Edit post buttons
    tbody.querySelectorAll('.wp-edit-post-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const postId = Number(btn.dataset.postId);
            const posts = wpGetPosts();
            const post = posts.find(p => p.id === postId);
            if (!post) return;
            wpOpenPostForm(post);
        });
    });

    // Delete post buttons
    tbody.querySelectorAll('.wp-delete-post-btn, .wp-trash-post-icon-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const postId = Number(btn.dataset.postId);
            wpDeletePost(postId);
        });
    });
}

function wpDeletePost(postId) {
    const posts = wpGetPosts();
    const filtered = posts.filter(p => p.id !== postId);
    wpSavePosts(filtered);
    wpRenderPostsTable();
    wpRenderBlogPosts();
    showToast('Post moved to trash.', 'info');
}

// ---- Post Editor (Add / Edit) ----
function wpOpenPostForm(existingPost = null) {
    const container = document.getElementById('wp-new-post-form-container');
    const titleEl = document.getElementById('wp-post-title');
    const categoryEl = document.getElementById('wp-post-category');
    const excerptEl = document.getElementById('wp-post-excerpt');
    const colorEl = document.getElementById('wp-post-color-theme');
    const editIdEl = document.getElementById('wp-post-edit-id');
    const formTitle = document.getElementById('wp-post-form-title');
    const saveBtn = document.getElementById('wp-post-save-btn');

    if (!container) return;
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });

    if (existingPost) {
        if (formTitle) formTitle.textContent = 'Edit Post';
        if (saveBtn) saveBtn.textContent = 'Update';
        if (editIdEl) editIdEl.value = existingPost.id;
        if (titleEl) titleEl.value = existingPost.title;
        if (categoryEl) categoryEl.value = existingPost.category;
        if (excerptEl) excerptEl.value = existingPost.excerpt;
        if (colorEl) colorEl.value = existingPost.color;
    } else {
        if (formTitle) formTitle.textContent = 'Add New Post';
        if (saveBtn) saveBtn.textContent = 'Publish';
        if (editIdEl) editIdEl.value = '';
        if (titleEl) titleEl.value = '';
        if (excerptEl) excerptEl.value = '';
    }
}

// ---- Render Plugins Table ----
function wpRenderPluginsTable() {
    const plugins = wpGetPlugins();
    const tbody = document.getElementById('wp-plugins-table-body');
    const sidebarCount = document.getElementById('wp-sidebar-plugins-count');
    if (!tbody) return;

    const activeCount = plugins.filter(p => p.active).length;
    if (sidebarCount) sidebarCount.textContent = activeCount;

    tbody.innerHTML = plugins.map(plugin => `
        <tr style="${plugin.active ? '' : 'background: #fff8f8;'}">
            <td>
                <strong>${plugin.name}</strong>
                <span style="color:#646970; font-size:11px; margin-left:6px;">v${plugin.version}</span>
                <div style="margin-top:6px; display:flex; gap:10px;">
                    <button class="wp-plugin-toggle-btn" data-plugin-id="${plugin.id}" style="background:none; border:none; cursor:pointer; padding:0; color:${plugin.active ? '#d63638' : '#00884f'}; font-size:12px; font-weight:600;">
                        ${plugin.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <span style="color:#ccd0d4;">|</span>
                    <a href="#" style="color:#2271b1; font-size:12px;">Settings</a>
                </div>
            </td>
            <td style="color:#50575e; font-size:12px;">${plugin.description}</td>
            <td style="text-align:right;">
                <span style="display:inline-flex; align-items:center; gap:5px; font-size:12px; font-weight:600; color:${plugin.active ? '#00884f' : '#d63638'};">
                    <span style="width:8px;height:8px;border-radius:50%;background:${plugin.active ? '#00884f' : '#d63638'};display:inline-block;"></span>
                    ${plugin.active ? 'Active' : 'Inactive'}
                </span>
            </td>
        </tr>
    `).join('');

    // Toggle buttons
    tbody.querySelectorAll('.wp-plugin-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pluginId = btn.dataset.pluginId;
            const plugins = wpGetPlugins();
            const plugin = plugins.find(p => p.id === pluginId);
            if (!plugin) return;
            plugin.active = !plugin.active;
            wpSavePlugins(plugins);
            wpRenderPluginsTable();
            showToast(`${plugin.name} has been ${plugin.active ? 'activated' : 'deactivated'}.`, plugin.active ? 'success' : 'info');
        });
    });
}

// ---- Quick Draft ----
function wpRenderDrafts() {
    const draftsList = document.getElementById('wp-drafts-list');
    if (!draftsList) return;
    const drafts = wpGetDrafts();
    if (drafts.length === 0) {
        draftsList.innerHTML = '<p style="color:#8c8f94; font-size:12px;">No saved drafts yet.</p>';
        return;
    }
    draftsList.innerHTML = drafts.map(d => `
        <div class="wp-draft-item">
            <strong>${d.title}</strong>
            <p>${d.content.substring(0, 80)}${d.content.length > 80 ? '…' : ''}</p>
        </div>
    `).join('');
}

// ---- Load Customizer Inputs from Saved Settings ----
function wpLoadCustomizerInputs() {
    const settings = wpGetSettings();
    const siteTitle = document.getElementById('wp-customizer-site-title');
    const eyebrow = document.getElementById('wp-customizer-hero-eyebrow');
    const headline = document.getElementById('wp-customizer-hero-headline');
    const desc = document.getElementById('wp-customizer-hero-desc');
    const btn = document.getElementById('wp-customizer-hero-btn-text');
    const color = document.getElementById('wp-customizer-primary-color');
    const colorHex = document.getElementById('wp-customizer-color-hex');

    if (siteTitle) siteTitle.value = settings.siteTitle;
    if (eyebrow) eyebrow.value = settings.heroEyebrow;
    if (headline) headline.value = settings.heroHeadline;
    if (desc) desc.value = settings.heroDesc;
    if (btn) btn.value = settings.heroBtnText;
    if (color) color.value = settings.primaryColor;
    if (colorHex) colorHex.textContent = settings.primaryColor;

    const activePreset = settings.themePreset || 'classic';
    document.querySelectorAll('.preset-btn').forEach(btnEl => {
        btnEl.classList.toggle('active', btnEl.dataset.preset === activePreset);
    });
}

// ---- WP Admin Overlay: Open / Close ----
const wpAdminOverlay = document.getElementById('wp-admin-overlay');

function openWpAdmin(defaultTab) {
    if (!wpAdminOverlay) return;
    wpAdminOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Switch to a tab if specified
    if (defaultTab) wpSwitchAdminTab(defaultTab);
    // Render all dynamic content
    wpRenderBlogPosts();
    wpRenderPostsTable();
    wpRenderPluginsTable();
    wpRenderDrafts();
    wpLoadCustomizerInputs();
    wpRenderMediaGrid();
    wpRenderCommentsTable();
    wpRenderThemesGrid();
    wpRenderAnalytics();
}

function closeWpAdmin() {
    if (!wpAdminOverlay) return;
    wpAdminOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ---- Tab Switcher ----
function wpSwitchAdminTab(tabName) {
    // Update sidebar active state
    document.querySelectorAll('.wp-admin-sidebar li.menu-item').forEach(li => {
        li.classList.toggle('active', li.dataset.wpTab === tabName);
    });
    // Show correct view
    document.querySelectorAll('.wp-admin-view').forEach(view => {
        view.classList.toggle('active', view.id === `wp-view-${tabName}`);
    });
}

// ---- Main WP Initialization ----
function wpInit() {
    // ---- Apply saved settings on page load ----
    const settings = wpGetSettings();
    wpApplySettings(settings);
    wpRenderBlogPosts();

    // Preset button click listener
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const preset = btn.dataset.preset;
            const presets = {
                classic: '#0066ff',
                neon: '#00f0ff',
                sunset: '#ff5e3a',
                emerald: '#059669',
                royal: '#6366f1'
            };
            
            const colorInput = document.getElementById('wp-customizer-primary-color');
            if (colorInput && presets[preset]) {
                colorInput.value = presets[preset];
                colorInput.dispatchEvent(new Event('input'));
            }
        });
    });

    // ---- Sync WP admin bar user name from CRM auth ----
    function syncWpBarUser() {
        const stored = localStorage.getItem('nexa_user');
        const nameEl = document.getElementById('wp-admin-user-name');
        const avatarEl = document.getElementById('wp-admin-avatar');
        const cardNameEl = document.getElementById('wp-admin-user-card-name');
        const cardAvatarEl = document.getElementById('wp-admin-user-card-avatar');
        if (stored) {
            const user = JSON.parse(stored);
            const letter = user.name ? user.name[0].toUpperCase() : 'A';
            if (nameEl) nameEl.textContent = user.name;
            if (avatarEl) avatarEl.textContent = letter;
            if (cardNameEl) cardNameEl.textContent = user.name;
            if (cardAvatarEl) cardAvatarEl.textContent = letter;
        }
    }
    syncWpBarUser();

    // ---- WP Admin Bar Buttons: open WP admin ----
    const wpBarTriggers = [
        { id: 'wp-admin-logo-btn', tab: 'dashboard' },
        { id: 'wp-admin-site-name-btn', tab: 'dashboard' },
        { id: 'wp-admin-sub-dashboard-btn', tab: 'dashboard' },
        { id: 'wp-admin-sub-themes-btn', tab: 'customizer' },
        { id: 'wp-admin-sub-menus-btn', tab: 'pages' },
        { id: 'wp-admin-customize-btn', tab: 'customizer' },
        { id: 'wp-admin-edit-btn', tab: 'pages' },
        { id: 'wp-admin-elementor-btn', tab: 'customizer' },
        { id: 'wp-admin-about-btn', tab: 'dashboard' },
        { id: 'wp-admin-profile-btn', tab: 'settings' },
        { id: 'wp-admin-account-btn', tab: 'dashboard' },
    ];

    wpBarTriggers.forEach(({ id, tab }) => {
        const el = document.getElementById(id);
        el?.addEventListener('click', (e) => {
            e.preventDefault();
            openWpAdmin(tab);
        });
    });

    // WP Admin Bar logout
    document.getElementById('wp-admin-logout-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });

    // ---- WP Admin Overlay: Close Button ----
    document.getElementById('wp-admin-exit-btn')?.addEventListener('click', closeWpAdmin);

    // Visit Site btn
    document.getElementById('wp-view-site-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeWpAdmin();
    });

    // WP Admin overlay sidebar tab navigation
    document.querySelectorAll('.wp-admin-sidebar li.menu-item').forEach(li => {
        li.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = li.dataset.wpTab;
            if (tab) wpSwitchAdminTab(tab);
        });
    });

    // Internal tab trigger links (inside Welcome panel etc.)
    document.querySelectorAll('.wp-tab-trigger').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.dataset.targetTab;
            if (tab) wpSwitchAdminTab(tab);
        });
    });

    // Close WP admin via "View" links in pages
    document.querySelectorAll('.wp-view-site-close-btn-trigger').forEach(link => {
        link.addEventListener('click', () => closeWpAdmin());
    });

    // "Customize Your Site" and "Edit with Elementor" buttons -> open customizer tab
    document.querySelectorAll('.wp-customize-trigger-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            wpSwitchAdminTab('customizer');
        });
    });

    // Welcome panel Elementor link
    document.getElementById('wp-welcome-edit-elementor')?.addEventListener('click', (e) => {
        e.preventDefault();
        wpSwitchAdminTab('customizer');
    });

    // ---- Posts Manager ----
    document.getElementById('wp-add-new-post-btn')?.addEventListener('click', () => {
        wpOpenPostForm();
    });

    document.getElementById('wp-post-cancel-btn')?.addEventListener('click', () => {
        const container = document.getElementById('wp-new-post-form-container');
        if (container) container.style.display = 'none';
        document.getElementById('wp-post-editor-form')?.reset();
    });

    document.getElementById('wp-post-editor-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const editIdEl = document.getElementById('wp-post-edit-id');
        const editId = editIdEl ? Number(editIdEl.value) : null;
        const title = document.getElementById('wp-post-title').value.trim();
        const category = document.getElementById('wp-post-category').value;
        const excerpt = document.getElementById('wp-post-excerpt').value.trim();
        const color = document.getElementById('wp-post-color-theme').value;

        let posts = wpGetPosts();

        if (editId) {
            // Update existing post
            const idx = posts.findIndex(p => p.id === editId);
            if (idx > -1) {
                posts[idx] = { ...posts[idx], title, category, excerpt, color };
                showToast(`Post "${title}" updated successfully!`, 'success');
            }
        } else {
            // Create new post
            const newPost = {
                id: Date.now(),
                title,
                category,
                excerpt,
                color,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                author: 'admin',
            };
            posts.unshift(newPost);
            showToast(`Post "${title}" published successfully!`, 'success');
        }

        wpSavePosts(posts);
        wpRenderPostsTable();
        wpRenderBlogPosts();

        const container = document.getElementById('wp-new-post-form-container');
        if (container) container.style.display = 'none';
        document.getElementById('wp-post-editor-form')?.reset();
        document.getElementById('wp-post-edit-id').value = '';
    });

    // ---- Quick Draft ----
    document.getElementById('wp-quick-draft-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('wp-draft-title').value.trim();
        const content = document.getElementById('wp-draft-content').value.trim();

        const drafts = wpGetDrafts();
        drafts.unshift({ id: Date.now(), title, content });
        wpSaveDrafts(drafts);
        wpRenderDrafts();

        document.getElementById('wp-quick-draft-form').reset();
        showToast('Draft saved successfully!', 'success');
    });

    // ---- Live Customizer: Color Picker Preview ----
    document.getElementById('wp-customizer-primary-color')?.addEventListener('input', (e) => {
        const hex = e.target.value;
        const hexLabel = document.getElementById('wp-customizer-color-hex');
        if (hexLabel) hexLabel.textContent = hex;
        // Live preview the color
        document.documentElement.style.setProperty('--primary', hex);
    });

    // ---- Customizer: Publish Changes ----
    document.getElementById('wp-customizer-publish-btn')?.addEventListener('click', () => {
        const activePresetEl = document.querySelector('.preset-btn.active');
        const themePreset = activePresetEl ? activePresetEl.dataset.preset : 'classic';

        const newSettings = {
            siteTitle: document.getElementById('wp-customizer-site-title')?.value || wpDefaultSettings.siteTitle,
            heroEyebrow: document.getElementById('wp-customizer-hero-eyebrow')?.value || wpDefaultSettings.heroEyebrow,
            heroHeadline: document.getElementById('wp-customizer-hero-headline')?.value || wpDefaultSettings.heroHeadline,
            heroDesc: document.getElementById('wp-customizer-hero-desc')?.value || wpDefaultSettings.heroDesc,
            heroBtnText: document.getElementById('wp-customizer-hero-btn-text')?.value || wpDefaultSettings.heroBtnText,
            primaryColor: document.getElementById('wp-customizer-primary-color')?.value || wpDefaultSettings.primaryColor,
            themePreset: themePreset
        };
        wpSaveSettings(newSettings);
        wpApplySettings(newSettings);
        showToast('Changes published successfully! Your site has been updated.', 'success');
    });

    // ---- Customizer: Reset to Defaults ----
    document.getElementById('wp-customizer-reset-btn')?.addEventListener('click', () => {
        wpSaveSettings({ ...wpDefaultSettings });
        wpApplySettings(wpDefaultSettings);
        wpLoadCustomizerInputs();
        showToast('Settings reset to defaults.', 'info');
    });

    // ---- General Settings Form ----
    document.getElementById('wp-settings-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Settings saved successfully!', 'success');
    });

    // ---- New Feature Inits ----
    wpInitMedia();
    wpInitComments();
    wpInitThemes();
}



// ============================================================
// MEDIA LIBRARY
// ============================================================
const wpDefaultMedia = [
    { id: 1, name: 'hero-banner.jpg', type: 'images', size: '245 KB', date: 'Jun 8, 2026', thumb: 'https://picsum.photos/seed/hero/300/200' },
    { id: 2, name: 'team-photo.jpg', type: 'images', size: '180 KB', date: 'Jun 5, 2026', thumb: 'https://picsum.photos/seed/team/300/200' },
    { id: 3, name: 'dashboard-screenshot.png', type: 'images', size: '320 KB', date: 'Jun 3, 2026', thumb: 'https://picsum.photos/seed/dash/300/200' },
    { id: 4, name: 'logo-white.png', type: 'images', size: '42 KB', date: 'May 28, 2026', thumb: 'https://picsum.photos/seed/logo/300/200' },
    { id: 5, name: 'product-video-thumb.jpg', type: 'images', size: '198 KB', date: 'May 25, 2026', thumb: 'https://picsum.photos/seed/product/300/200' },
    { id: 6, name: 'case-study.pdf', type: 'documents', size: '1.2 MB', date: 'May 20, 2026', thumb: null },
    { id: 7, name: 'pricing-guide.pdf', type: 'documents', size: '560 KB', date: 'May 18, 2026', thumb: null },
    { id: 8, name: 'webinar-recording.jpg', type: 'images', size: '210 KB', date: 'May 15, 2026', thumb: 'https://picsum.photos/seed/webinar/300/200' },
];

function wpGetMedia() {
    const s = localStorage.getItem('wp_media');
    return s ? JSON.parse(s) : [...wpDefaultMedia];
}
function wpSaveMedia(items) { localStorage.setItem('wp_media', JSON.stringify(items)); }

let wpMediaFilter = 'all';

function wpRenderMediaGrid() {
    const grid = document.getElementById('wp-media-grid');
    if (!grid) return;
    const items = wpGetMedia();
    const filtered = wpMediaFilter === 'all' ? items : items.filter(i => i.type === wpMediaFilter);
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="color:#8c8f94; padding:20px;">No media found.</p>';
        return;
    }
    grid.innerHTML = filtered.map(item => {
        if (item.thumb) {
            return `<div class="wp-media-item" data-media-id="${item.id}">
                <div class="wp-media-thumb" style="background-image:url('${item.thumb}');"></div>
                <div class="wp-media-info">
                    <span class="wp-media-name">${item.name}</span>
                    <span class="wp-media-meta">${item.size} &bull; ${item.date}</span>
                </div>
                <button class="wp-media-delete-btn" data-media-id="${item.id}" title="Delete">\uD83D\uDDD1</button>
            </div>`;
        } else {
            return `<div class="wp-media-item doc-item" data-media-id="${item.id}">
                <div class="wp-media-doc-icon">\uD83D\uDCC4</div>
                <div class="wp-media-info">
                    <span class="wp-media-name">${item.name}</span>
                    <span class="wp-media-meta">${item.size} &bull; ${item.date}</span>
                </div>
                <button class="wp-media-delete-btn" data-media-id="${item.id}" title="Delete">\uD83D\uDDD1</button>
            </div>`;
        }
    }).join('');

    grid.querySelectorAll('.wp-media-delete-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const id = Number(btn.dataset.mediaId);
            const media = wpGetMedia().filter(m => m.id !== id);
            wpSaveMedia(media);
            wpRenderMediaGrid();
            showToast('Media file deleted.', 'info');
        });
    });
}

function wpInitMedia() {
    document.querySelectorAll('.media-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.media-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            wpMediaFilter = btn.dataset.filter;
            wpRenderMediaGrid();
        });
    });

    document.getElementById('wp-media-upload-input')?.addEventListener('change', e => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const media = wpGetMedia();
        files.forEach(file => {
            const isImg = file.type.startsWith('image/');
            media.unshift({
                id: Date.now() + Math.random(),
                name: file.name,
                type: isImg ? 'images' : 'documents',
                size: file.size > 1048576 ? (file.size / 1048576).toFixed(1) + ' MB' : Math.round(file.size / 1024) + ' KB',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                thumb: isImg ? URL.createObjectURL(file) : null
            });
        });
        wpSaveMedia(media);
        wpRenderMediaGrid();
        showToast(files.length + ' file(s) uploaded successfully!', 'success');
        e.target.value = '';
    });
}

// ============================================================
// COMMENTS MANAGER
// ============================================================
const wpDefaultComments = [
    { id: 1, author: 'John Smith', email: 'john@example.com', content: 'Great article! Really helped me understand CRM strategies better. Looking forward to more content like this.', post: '5 CRM Strategies That Accelerate Growth', date: 'Jun 8, 2026', status: 'approved' },
    { id: 2, author: 'Sarah Lee', email: 'sarah@techcorp.io', content: 'This case study is amazing. We implemented similar strategies and saw a 38% increase in Q2.', post: 'How TechCorp Increased Sales by 45%', date: 'Jun 6, 2026', status: 'approved' },
    { id: 3, author: 'Mike Davis', email: 'mike@startup.co', content: 'When will the AI lead scoring feature be available on the Starter plan?', post: 'Introducing AI-Powered Lead Scoring', date: 'Jun 3, 2026', status: 'pending' },
    { id: 4, author: 'Rachel Kim', email: 'rachel@company.org', content: 'I love the integration with Slack and HubSpot. Seamless workflow now!', post: 'Connect Your Favorite Tools to NexaCRM', date: 'May 29, 2026', status: 'approved' },
    { id: 5, author: 'Tom Brown', email: 'tom@sales.net', content: 'Could you share a recording of the webinar for those who missed it?', post: 'Live Demo: Advanced Pipeline Management', date: 'May 22, 2026', status: 'pending' },
];

function wpGetComments() {
    const s = localStorage.getItem('wp_comments');
    return s ? JSON.parse(s) : [...wpDefaultComments];
}
function wpSaveComments(c) { localStorage.setItem('wp_comments', JSON.stringify(c)); }

let wpCommentsFilter = 'all';

function wpRenderCommentsTable() {
    const tbody = document.getElementById('wp-comments-table-body');
    if (!tbody) return;
    const all = wpGetComments();
    const shown = wpCommentsFilter === 'all' ? all : all.filter(c => c.status === wpCommentsFilter);

    if (shown.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="padding:20px; color:#8c8f94;">No comments found.</td></tr>';
        return;
    }

    tbody.innerHTML = shown.map(c => {
        const statusColor = c.status === 'approved' ? '#00a32a' : c.status === 'pending' ? '#dba617' : '#d63638';
        const statusLabel = c.status.charAt(0).toUpperCase() + c.status.slice(1);
        const approveBtn = c.status === 'pending'
            ? `<button class="wp-comment-approve-btn" data-comment-id="${c.id}" style="font-size:11px;padding:2px 8px;border:1px solid #00a32a;border-radius:3px;color:#00a32a;background:none;cursor:pointer;">\u2713 Approve</button>`
            : '';
        return `<tr class="wp-comment-row" data-comment-id="${c.id}">
            <td><input type="checkbox" class="wp-comment-checkbox" data-comment-id="${c.id}" /></td>
            <td>
                <div style="display:flex;align-items:center;gap:8px;">
                    <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0;">${c.author[0].toUpperCase()}</div>
                    <div>
                        <strong style="font-size:13px;">${c.author}</strong>
                        <div style="font-size:11px;color:#8c8f94;">${c.email}</div>
                    </div>
                </div>
            </td>
            <td style="max-width:280px;">
                <p style="margin:0;font-size:13px;color:#1d2327;">${c.content.substring(0, 100)}${c.content.length > 100 ? '\u2026' : ''}</p>
                <div style="display:flex;gap:8px;margin-top:6px;">
                    ${approveBtn}
                    <button class="wp-comment-delete-btn" data-comment-id="${c.id}" style="font-size:11px;padding:2px 8px;border:1px solid #d63638;border-radius:3px;color:#d63638;background:none;cursor:pointer;">Trash</button>
                </div>
            </td>
            <td style="font-size:12px;color:#2271b1;">${c.post.substring(0, 35)}${c.post.length > 35 ? '\u2026' : ''}</td>
            <td style="font-size:12px;white-space:nowrap;">${c.date}</td>
            <td style="text-align:right;">
                <span style="font-size:11px;padding:3px 8px;border-radius:12px;background:${c.status === 'approved' ? '#e6f4ea' : c.status === 'pending' ? '#fef9e7' : '#fde8e8'};color:${statusColor};font-weight:600;">${statusLabel}</span>
            </td>
        </tr>`;
    }).join('');

    tbody.querySelectorAll('.wp-comment-approve-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.commentId);
            const comments = wpGetComments().map(c => c.id === id ? { ...c, status: 'approved' } : c);
            wpSaveComments(comments);
            wpRenderCommentsTable();
            showToast('Comment approved!', 'success');
        });
    });

    tbody.querySelectorAll('.wp-comment-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.commentId);
            wpSaveComments(wpGetComments().filter(c => c.id !== id));
            wpRenderCommentsTable();
            showToast('Comment moved to trash.', 'info');
        });
    });
}

function wpInitComments() {
    document.querySelectorAll('.comment-filter-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.comment-filter-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            wpCommentsFilter = btn.dataset.cfilter;
            wpRenderCommentsTable();
        });
    });
    document.getElementById('wp-comments-select-all')?.addEventListener('change', e => {
        document.querySelectorAll('.wp-comment-checkbox').forEach(cb => { cb.checked = e.target.checked; });
    });
}

// ============================================================
// THEMES MANAGER
// ============================================================
const wpDefaultThemes = [
    { id: 'nexatheme', name: 'NexaTheme', version: '1.0.0', description: 'A sleek, modern corporate theme built for SaaS and CRM products. Highly customizable with live preview support.', active: true, preview: 'linear-gradient(135deg,#0066ff 0%,#00c875 100%)', tags: ['Business', 'Corporate', 'Responsive'] },
    { id: 'astra', name: 'Astra', version: '4.6.2', description: 'Fast, fully customizable & beautiful WordPress theme suitable for blogs, portfolios, and business websites.', active: false, preview: 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)', tags: ['Multipurpose', 'Fast', 'SEO-Ready'] },
    { id: 'hello-elementor', name: 'Hello Elementor', version: '3.1.0', description: 'A plain-canvas, lightweight & fast starter theme for Elementor users. Pairs perfectly with any Elementor kit.', active: false, preview: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)', tags: ['Elementor', 'Minimal', 'Starter'] },
    { id: 'oceanwp', name: 'OceanWP', version: '3.5.4', description: 'A multipurpose WordPress theme ideal for blogging, shopping, and business sites.', active: false, preview: 'linear-gradient(135deg,#0891b2 0%,#0e7490 100%)', tags: ['Multipurpose', 'WooCommerce', 'Retina'] },
    { id: 'divi', name: 'Divi', version: '4.24.0', description: 'The most popular WordPress theme in the world with a powerful visual builder and hundreds of layouts.', active: false, preview: 'linear-gradient(135deg,#7c3aed 0%,#db2777 100%)', tags: ['Visual Builder', 'Popular', 'Premium'] },
    { id: 'generatepress', name: 'GeneratePress', version: '3.4.0', description: 'A lightweight yet powerful theme that prioritizes speed, stability, and accessibility.', active: false, preview: 'linear-gradient(135deg,#059669 0%,#10b981 100%)', tags: ['Lightweight', 'Accessible', 'Fast'] },
];

function wpGetThemes() {
    const s = localStorage.getItem('wp_themes');
    return s ? JSON.parse(s) : [...wpDefaultThemes];
}
function wpSaveThemes(t) { localStorage.setItem('wp_themes', JSON.stringify(t)); }

function wpRenderThemesGrid() {
    const grid = document.getElementById('wp-themes-grid');
    if (!grid) return;
    const themes = wpGetThemes();
    grid.innerHTML = themes.map(theme => `
        <div class="wp-theme-card ${theme.active ? 'active-theme' : ''}">
            <div class="wp-theme-preview" style="background:${theme.preview};">
                ${theme.active ? '<span class="wp-theme-active-badge">Active</span>' : ''}
            </div>
            <div class="wp-theme-body">
                <div class="wp-theme-header-row">
                    <strong class="wp-theme-name">${theme.name}</strong>
                    <span class="wp-theme-version">v${theme.version}</span>
                </div>
                <p class="wp-theme-desc">${theme.description}</p>
                <div class="wp-theme-tags">${theme.tags.map(t => `<span class="wp-theme-tag">${t}</span>`).join('')}</div>
                <div class="wp-theme-actions">
                    ${theme.active
                        ? `<button class="wp-theme-btn" disabled style="background:#f0f0f1;color:#8c8f94;cursor:not-allowed;">\u2713 Active Theme</button>
                           <button class="wp-theme-btn wp-customize-trigger-link secondary" data-theme-id="${theme.id}">Customize</button>`
                        : `<button class="wp-theme-activate-btn wp-theme-btn primary" data-theme-id="${theme.id}">Activate</button>
                           <button class="wp-theme-preview-btn wp-theme-btn secondary" data-theme-id="${theme.id}">Live Preview</button>`
                    }
                </div>
            </div>
        </div>
    `).join('');

    grid.querySelectorAll('.wp-theme-activate-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.themeId;
            const updatedThemes = wpGetThemes().map(t => ({ ...t, active: t.id === id }));
            wpSaveThemes(updatedThemes);
            wpRenderThemesGrid();
            const theme = updatedThemes.find(t => t.id === id);
            showToast('Theme "' + (theme ? theme.name : '') + '" activated successfully!', 'success');
        });
    });

    grid.querySelectorAll('.wp-theme-preview-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.themeId;
            const theme = wpGetThemes().find(t => t.id === id);
            showToast('Previewing "' + (theme ? theme.name : '') + '" — click Activate to apply.', 'info');
        });
    });

    grid.querySelectorAll('.wp-customize-trigger-link').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            wpSwitchAdminTab('customizer');
        });
    });
}

function wpInitThemes() {
    document.getElementById('wp-add-theme-btn')?.addEventListener('click', () => {
        showToast('Opening WordPress Theme Repository\u2026 (simulated)', 'info');
    });
}

// ============================================================
// ANALYTICS
// ============================================================
function wpRenderAnalytics() {
    const targets = [
        { id: 'wp-stat-views', target: 48732, suffix: '' },
        { id: 'wp-stat-visitors', target: 12905, suffix: '' },
        { id: 'wp-stat-duration', target: 247, suffix: 's' },
        { id: 'wp-stat-bounce', target: 38, suffix: '%' },
    ];
    targets.forEach(function(item) {
        const el = document.getElementById(item.id);
        if (!el) return;
        let current = 0;
        const step = Math.ceil(item.target / 60);
        const timer = setInterval(function() {
            current = Math.min(current + step, item.target);
            el.textContent = current.toLocaleString() + item.suffix;
            if (current >= item.target) clearInterval(timer);
        }, 20);
    });

    const topPages = [
        { page: '/ (Home)', views: 18420 },
        { page: '/features', views: 9103 },
        { page: '/pricing', views: 7654 },
        { page: '/blog', views: 5890 },
        { page: '/about', views: 2310 },
    ];
    const tbody = document.getElementById('wp-top-pages-body');
    if (tbody) {
        tbody.innerHTML = topPages.map(function(p) {
            return '<tr><td>' + p.page + '</td><td style="text-align:right;font-weight:600;">' + p.views.toLocaleString() + '</td></tr>';
        }).join('');
    }

    const sources = [
        { label: 'Organic Search', value: 42, color: '#6366f1' },
        { label: 'Direct', value: 28, color: '#10b981' },
        { label: 'Social Media', value: 18, color: '#f59e0b' },
        { label: 'Referral', value: 8, color: '#ec4899' },
        { label: 'Email', value: 4, color: '#0891b2' },
    ];
    const sourcesWrap = document.getElementById('wp-sources-chart-wrap');
    if (sourcesWrap) {
        sourcesWrap.innerHTML = sources.map(function(s) {
            return '<div style="display:flex;align-items:center;gap:10px;">' +
                '<span style="font-size:12px;width:110px;color:#3c434a;">' + s.label + '</span>' +
                '<div style="flex:1;background:#e0e0e0;border-radius:4px;height:10px;overflow:hidden;">' +
                '<div style="height:100%;width:' + s.value + '%;background:' + s.color + ';border-radius:4px;transition:width 1s ease;"></div>' +
                '</div>' +
                '<span style="font-size:12px;font-weight:700;color:' + s.color + ';width:30px;">' + s.value + '%</span>' +
                '</div>';
        }).join('');
    }

    const trafficCanvas = document.getElementById('wp-traffic-chart');
    if (trafficCanvas && trafficCanvas.getContext) {
        const ctx = trafficCanvas.getContext('2d');
        const w = trafficCanvas.parentElement ? trafficCanvas.parentElement.offsetWidth - 40 : 500;
        trafficCanvas.width = w;
        trafficCanvas.height = 180;
        const data = [820,940,750,1100,1280,960,1320,1450,1210,1600,1390,1720,1540,1850,1430,1960,2100,1830,2250,2040,2380,2120,2540,2300,2650,2410,2750,2890,3010,2980];
        const maxD = Math.max.apply(null, data);
        const padL=40, padR=10, padT=10, padB=25;
        const cw = w - padL - padR, ch = trafficCanvas.height - padT - padB;
        ctx.clearRect(0, 0, w, trafficCanvas.height);
        ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 1;
        [0, 0.25, 0.5, 0.75, 1].forEach(function(t) {
            const y = padT + ch * (1 - t);
            ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
            ctx.fillStyle = '#8c8f94'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
            ctx.fillText(Math.round(maxD * t).toLocaleString(), padL - 4, y + 3);
        });
        const grad = ctx.createLinearGradient(0, padT, 0, padT + ch);
        grad.addColorStop(0, 'rgba(99,102,241,0.35)');
        grad.addColorStop(1, 'rgba(99,102,241,0)');
        ctx.beginPath();
        data.forEach(function(v, i) {
            const x = padL + i * cw / (data.length - 1), y = padT + ch * (1 - v / maxD);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.lineTo(padL + cw, padT + ch); ctx.lineTo(padL, padT + ch); ctx.closePath();
        ctx.fillStyle = grad; ctx.fill();
        ctx.beginPath(); ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2;
        data.forEach(function(v, i) {
            const x = padL + i * cw / (data.length - 1), y = padT + ch * (1 - v / maxD);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
    }

    const deviceCanvas = document.getElementById('wp-device-chart');
    if (deviceCanvas && deviceCanvas.getContext) {
        const ctx = deviceCanvas.getContext('2d');
        deviceCanvas.width = deviceCanvas.parentElement ? deviceCanvas.parentElement.offsetWidth - 40 : 280;
        deviceCanvas.height = 180;
        const dw = deviceCanvas.width;
        const devices = [
            { label: 'Desktop', value: 55, color: '#6366f1' },
            { label: 'Mobile', value: 35, color: '#10b981' },
            { label: 'Tablet', value: 10, color: '#f59e0b' },
        ];
        const cx2 = dw / 2, cy2 = 80, r = 60;
        let startAngle = -Math.PI / 2;
        ctx.clearRect(0, 0, dw, deviceCanvas.height);
        devices.forEach(function(d) {
            const slice = (d.value / 100) * 2 * Math.PI;
            ctx.beginPath(); ctx.moveTo(cx2, cy2);
            ctx.arc(cx2, cy2, r, startAngle, startAngle + slice);
            ctx.closePath(); ctx.fillStyle = d.color; ctx.fill();
            startAngle += slice;
        });
        ctx.beginPath(); ctx.arc(cx2, cy2, r * 0.55, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff'; ctx.fill();
        ctx.fillStyle = '#1d2327'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Devices', cx2, cy2 + 5);
        devices.forEach(function(d, i) {
            const legY = cy2 + r + 20;
            const lx = 20 + i * (dw / 3);
            ctx.fillStyle = d.color; ctx.fillRect(lx, legY, 10, 10);
            ctx.fillStyle = '#3c434a'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left';
            ctx.fillText(d.label + ' ' + d.value + '%', lx + 13, legY + 9);
        });
    }
}

