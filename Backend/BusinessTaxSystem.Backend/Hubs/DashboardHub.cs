using Microsoft.AspNetCore.SignalR;

namespace BusinessTaxSystem.Backend.Hubs
{
    public class DashboardHub : Hub
    {
        public async Task SendUpdate(string message)
        {
            await Clients.All.SendAsync("ReceiveUpdate", message);
        }

        public async Task NotifyAssetChange(string action, object asset)
        {
            await Clients.All.SendAsync("AssetChanged", new { action, asset });
        }

        public async Task NotifyFinanceChange(string action, object financeData)
        {
            await Clients.All.SendAsync("FinanceChanged", new { action, data = financeData });
        }

        public async Task NotifyTaxChange(string action, object taxData)
        {
            await Clients.All.SendAsync("TaxChanged", new { action, data = taxData });
        }
    }
}
