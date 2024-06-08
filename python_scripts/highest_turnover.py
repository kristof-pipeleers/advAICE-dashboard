import pandas as pd

# Read the CSV file
file_path = r"C:\Users\Kristof Pipeleers\Desktop\SOCS project\Code\healthcare_visualisation\farma_companies\processed_farma_companies_with_filtered_nace.csv"
df = pd.read_csv(file_path)

# Convert the 'Turnover' column to numeric, removing any non-numeric characters if necessary
df['Turnover'] = pd.to_numeric(df['Turnover'].str.replace(',', ''), errors='coerce')

# Find the highest turnover
highest_turnover = df['Turnover'].max()

# Find the company with the highest turnover
company_with_highest_turnover = df[df['Turnover'] == highest_turnover]

# Get the company name and address
company_name = company_with_highest_turnover['Company Name'].values[0]
company_address = company_with_highest_turnover['Full Address'].values[0]

# Print the results
print(f'The highest turnover is: €{highest_turnover}')
print(f'Company Name: {company_name}')
print(f'Address: {company_address}')
