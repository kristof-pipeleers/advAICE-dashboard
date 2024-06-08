import pandas as pd

# Load the datasets with specified data types to ensure IDs are read as strings
df = pd.read_csv('processed_farma_companies_with_filtered_nace_and_postal.csv', dtype={'Company ID': str})


# Specify the new column order
new_column_order = [
    'Company Name', 'Full Address', 'Latitude', 'Longitude', 'Street', 'Number', 
    'Postal Code', 'City Name', 'Country', 'Activities', 'NACE Descriptions', 
    'Company ID', 'Start Date', 'See Also', 'Number of Employees', 'Turnover', 
    'Last Year', 'Sector'
]

# Reorder the DataFrame columns
df = df[new_column_order]

# Save the modified DataFrame to a new CSV file
df.to_csv("pharma_comapanies_dataset.csv", index=False)

print("Successfully reordered the columns and saved to a new CSV file.")