const token = localStorage.getItem('authToken');
if (!token) window.location.href = '/login/login.html';

document.querySelector('.logout--btn').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    setTimeout(() => window.location.href = '/login/login.html', 500);
});

const addPlanContainer = document.querySelector('.addPlan__container');
const addPlanBtn = document.querySelector('.add__button');
const closeBtn = document.querySelector('.cancel__button');
addPlanBtn.addEventListener('click', () => addPlanContainer.style.display = 'flex');
closeBtn.addEventListener('click', () => addPlanContainer.style.display = 'none');

const statuses = document.querySelectorAll('.status');
const plansBodies = document.querySelectorAll('.plans__body');
const noPlansMsg = document.querySelector('.no--plan--message');
let activeTab = localStorage.getItem('activeTab') || 'all-plans';

function showTab(tabId) {
    statuses.forEach(s => s.classList.remove('active'));
    plansBodies.forEach(body => body.classList.add('hidden'));

    document.querySelector(`.status[data-attribute="${tabId}"]`)?.classList.add('active');
    const container = document.getElementById(tabId);
    if (container) container.classList.remove('hidden');

    addPlanBtn.style.display = tabId === 'all-plans' ? 'flex' : 'none';
    localStorage.setItem('activeTab', tabId);

    if (tabId === 'all-plans') loadPlans();
    else if (tabId === 'complete') loadCompletedPlans();
    else if (tabId === 'incomplete') loadIncompletePlans();

    noPlansMsg.style.display = container && container.children.length === 0 ? 'block' : 'none';
}

statuses.forEach(stat => {
    stat.addEventListener('click', () => showTab(stat.dataset.attribute));
});

function enablePlanActions(plan) {
    const title = plan.querySelector('.plan--title');
    const description = plan.querySelector('.plan--description');
    const startDate = plan.querySelector('.plan--start');
    const endDate = plan.querySelector('.plan--end');
    const buttons = plan.querySelector('.util__buttons');

    const editBtn = buttons.querySelector('.edit__icon');
    const deleteBtn = buttons.querySelector('.delete__icon');
    const saveBtn = buttons.querySelector('.save__btn');
    const cancelBtn = buttons.querySelector('.cancel__btn');
    const checkbox = buttons.querySelector('.check--input');

    let original = { title: title.textContent, description: description.textContent, startDate: startDate.value, endDate: endDate.value };

    function allowEdit() { title.contentEditable = description.contentEditable = "true"; startDate.disabled = endDate.disabled = false; }
    function disAllowEdit() { title.contentEditable = description.contentEditable = "false"; startDate.disabled = endDate.disabled = true; }
    function activateEditButtons() { editBtn.style.display = deleteBtn.style.display = 'none'; saveBtn.classList.remove('hidden'); cancelBtn.classList.remove('hidden'); }
    function cancelEditButtons() { editBtn.style.display = deleteBtn.style.display = 'flex'; saveBtn.classList.add('hidden'); cancelBtn.classList.add('hidden'); }
    function revertOriginal() { title.textContent = original.title; description.textContent = original.description; startDate.value = original.startDate; endDate.value = original.endDate; }

    editBtn.addEventListener('click', () => { activateEditButtons(); allowEdit(); });
    cancelBtn.addEventListener('click', () => { revertOriginal(); cancelEditButtons(); disAllowEdit(); });

    saveBtn.addEventListener('click', async () => {
        disAllowEdit(); cancelEditButtons();
        try {
            const res = await fetch(`http://localhost:8080/api/v1/plans/update/${plan.dataset.id}`, {
                method: 'PUT',
                headers: { 'Authorization': token, 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title.textContent, description: description.textContent, startDate: startDate.value, endDate: endDate.value })
            });
            if (!res.ok) throw new Error("Failed to update plan");
            original = { title: title.textContent, description: description.textContent, startDate: startDate.value, endDate: endDate.value };
        } catch (err) { console.error(err.message); alert(err.message); }
    });

    if (checkbox) {
        checkbox.addEventListener('change', async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/v1/plans/${plan.dataset.id}/mark`, { method: 'PATCH', headers: { 'Authorization': token, 'Content-Type': 'application/json' } });
                if (!res.ok) throw new Error("Failed to toggle plan status");
                showTab(activeTab); 
            } catch (err) { console.error(err.message); alert(err.message); }
        });
    }

    deleteBtn.addEventListener('click', async () => {
        if (!confirm("Are you sure you want to delete this plan?")) return;
        try {
            const res = await fetch(`http://localhost:8080/api/v1/plans/delete/${plan.dataset.id}`, { method: 'DELETE', headers: { 'Authorization': token } });
            if (!res.ok) throw new Error("Failed to delete plan");
            plan.remove();
        } catch (err) { console.error(err.message); alert(err.message); }
    });
}

function applyActions(container) {
    container.querySelectorAll('.plan').forEach(enablePlanActions);
}

document.querySelector(".save--btn").addEventListener("click", async e => {
    e.preventDefault();
    const title = document.getElementById("form--title").value;
    const description = document.getElementById("form--description").value;
    const startDate = document.getElementById("form--startDate").value;
    const endDate = document.getElementById("form--endDate").value;

    try {
        const res = await fetch("http://localhost:8080/api/v1/plans/addPlan", {
            method: 'POST',
            headers: { 'Authorization': token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, startDate, endDate })
        });
        if (!res.ok) { const errData = await res.json(); throw new Error(errData.message || "Failed to add plan"); }
        const newPlan = (await res.json()).planResponse;
        const planHTML = `
            <div class="plan row-flex" data-id="${newPlan.id}">
                <div class="individual__plan column-flex">
                    <div class="plan--title">${newPlan.title}</div>
                    <div class="plan--description">${newPlan.description}</div>
                    <div class="plan--dates row-flex">
                        Start:<input class="plan--start" type="date" value="${newPlan.startDate}" disabled>
                        End:<input class="plan--end" type="date" value="${newPlan.endDate}" disabled>
                        <div class="plan--status-lastModified">Last Modified: ${newPlan.lastModified}</div>
                    </div>
                </div>
                <div class="util__buttons row-flex">
                    <div class="check row-flex">
                        <input type="checkbox" class="check--input">
                        <label class="check--label">Mark/Unmark</label>
                    </div>
                    <div class="delete__icon"><img class="delete" src="/images/delete.png" alt=""></div>
                    <div class="edit__icon"><img src="/images/edit.png" alt="" class="edit"></div>
                    <button class="cancel__btn white__link-btn hover hidden">Cancel</button>
                    <button class="save__btn purple__link-btn hover hidden">Save</button>
                </div>
            </div>
        `;
        document.getElementById('all-plans').insertAdjacentHTML("afterbegin", planHTML);
        applyActions(document.getElementById('all-plans'));
        document.querySelector(".addPlan__form").reset();
        addPlanContainer.style.display = 'none';
        showTab('all-plans');
    } catch (err) { console.error(err.message); alert(err.message); }
});

async function loadPlans() {
    try {
        const res = await fetch("http://localhost:8080/api/v1/plans", { method: 'GET', headers: { 'Authorization': token, 'Content-Type': 'application/json' } });
        if (!res.ok) throw new Error("Failed to load plans");
        const data = await res.json();
        const container = document.getElementById('all-plans');
        container.innerHTML = "";
        data.plans.forEach(plan => {
            const planHTML = `
                <div class="plan row-flex" data-id="${plan.id}">
                    <div class="individual__plan column-flex">
                        <div class="plan--title">${plan.title}</div>
                        <div class="plan--description">${plan.description}</div>
                        <div class="plan--dates row-flex">
                            Start:<input class="plan--start" type="date" value="${plan.startDate ?? ''}" disabled>
                            End:<input class="plan--end" type="date" value="${plan.endDate ?? ''}" disabled>
                            <div class="plan--status-lastModified">Last Modified: ${plan.lastModified}</div>
                        </div>
                    </div>
                    <div class="util__buttons row-flex">
                        <div class="check row-flex">
                            <input type="checkbox" class="check--input" ${plan.completed ? "checked" : ""}>
                            <label class="check--label">Mark/Unmark</label>
                        </div>
                        <div class="delete__icon"><img class="delete" src="/images/delete.png" alt=""></div>
                        <div class="edit__icon"><img src="/images/edit.png" alt="" class="edit"></div>
                        <button class="cancel__btn white__link-btn hover hidden">Cancel</button>
                        <button class="save__btn purple__link-btn hover hidden">Save</button>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", planHTML);
        });
        applyActions(container);
    } catch (err) { console.error(err.message); alert(err.message); }
}

async function loadCompletedPlans() { await loadStatusPlans('complete', 'completed'); }
async function loadIncompletePlans() { await loadStatusPlans('incomplete', 'uncompleted'); }
async function loadStatusPlans(containerId, endpoint) {
    try {
        const res = await fetch(`http://localhost:8080/api/v1/plans/${endpoint}`, { method: 'GET', headers: { 'Authorization': token } });
        if (!res.ok) throw new Error(`Failed to load ${endpoint} plans`);
        const data = await res.json();
        const container = document.getElementById(containerId);
        container.innerHTML = "";
        data.plans.forEach(plan => {
            const planHTML = `
                <div class="plan row-flex">
                    <div class="individual__plan column-flex">
                        <div class="plan--title">${plan.title}</div>
                        <div class="plan--description">${plan.description}</div>
                        <div class="plan--dates row-flex">
                            Start: ${plan.startDate ?? ''} 
                            End: ${plan.endDate ?? ''} 
                            Last Modified: ${plan.lastModified}
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", planHTML);
        });
        noPlansMsg.style.display = container.children.length === 0 ? 'block' : 'none';
    } catch (err) { console.error(err.message); alert(err.message); }
}

document.addEventListener("DOMContentLoaded", () => showTab(activeTab));
