using System.Text;
using BusinessTaxSystem.Backend.Data;
using BusinessTaxSystem.Backend.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;


AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));


var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

builder.Services.AddAuthorization();
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJS",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowNextJS");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<BusinessTaxSystem.Backend.Hubs.DashboardHub>("/dashboardHub");

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        context.Database.EnsureCreated(); 
        
        if (!context.Roles.Any())
        {
            context.Roles.AddRange(
                new Role { Name = "Admin" },
                new Role { Name = "Accountant" },
                new Role { Name = "Staff" }
            );
            context.SaveChanges();
            logger.LogInformation("Roles seeded successfully.");
        }

        
        if (!context.AssetCategories.Any())
        {
            context.AssetCategories.AddRange(
                new AssetCategory { Name = "Office Equipment", Description = "Computers, Printers, etc." },
                new AssetCategory { Name = "Furniture", Description = "Desks, Chairs, etc." },
                new AssetCategory { Name = "Vehicles", Description = "Company Cars, Vans, etc." }
            );
            context.SaveChanges();
            logger.LogInformation("Asset categories seeded successfully.");
        }

       
        if (!context.Departments.Any())
        {
            context.Departments.AddRange(
                new Department { Name = "IT Department", Code = "IT" },
                new Department { Name = "Human Resources", Code = "HR" },
                new Department { Name = "Finance", Code = "FIN" },
                new Department { Name = "Operations", Code = "OPS" }
            );
            context.SaveChanges();
            logger.LogInformation("Departments seeded successfully.");
        }

        if (!context.ExpenseCategories.Any())
        {
            context.ExpenseCategories.AddRange(
                new ExpenseCategory { Name = "Office Supplies" },
                new ExpenseCategory { Name = "Utilities" },
                new ExpenseCategory { Name = "Rent" },
                new ExpenseCategory { Name = "Travel" },
                new ExpenseCategory { Name = "Marketing" },
                new ExpenseCategory { Name = "Professional Services" },
                new ExpenseCategory { Name = "Equipment" },
                new ExpenseCategory { Name = "Other" }
            );
            context.SaveChanges();
            logger.LogInformation("Expense categories seeded successfully.");
        }
        else
        {
            logger.LogInformation($"Expense categories already exist. Count: {context.ExpenseCategories.Count()}");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

app.Run();
