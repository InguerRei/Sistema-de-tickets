document.addEventListener('DOMContentLoaded', async () => {
    const totalTicketsEl = document.getElementById('totalTickets');
    const openTicketsEl = document.getElementById('openTickets');
    const inProgressTicketsEl = document.getElementById('inProgressTickets');
    const closedTicketsEl = document.getElementById('closedTickets');
    const ticketsBody = document.getElementById('ticketsTableBody');

    try{
        const response = await fetch('http://localhost:3000/tickets');
        if(!response.ok){
            throw new Error('Erro al cargar los tickets');
            }

            const tickets = await response.json();

            const total = tickets.length;
            const open = tickets.filter(ticket => tickets.status === 'abierto').length;
            const inProgress = tickets.filter(ticket => ticket.status === 'en_atencion').length;
            const closed = tickets.filter(ticket => ticket.status === 'resolvido').length;

            totalTicketsEl.textContent = total;
            openTicketsEl.textContent = open;
            inProgressTicketsEl.textContent = inProgress;
            closedTicketsEl.textContent = closed;

            if (!tickets.length){
                ticketsTableBody.innerHTML = `
                <tr>
                    <td colspan="6">Ningun Ticket Fue encontrado.</td>
                </tr>
                ;` 
            }
            return;
    }
    ticketsTableBody.innerHTML = tickets.map(ticket =>{
        const statusMap = {
            abierto = 'abierto',
            en_atencion = 'en atencion',
            resuelto = 'resuelto'
        };

        const statusClassMap = {
            abierto: 'status-open',
            en_atencion: 'status-progress',
            resuelto: 'status-done'
        };

        const status = statusClassMap[ticket.status] || 'abierto';
        const statusClass = statusClassMap [ticket.status] || 'status.open';

        return  `
        <tr>
            <td>#${ticket.id}</td>
            <td>${ticket.title}</td>
            <td>${ticket.category}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>${ticket.assigned_to || 'no Asignado'}</td>
            <td>${new Date{}}</td>
        </tr>`
    })
})