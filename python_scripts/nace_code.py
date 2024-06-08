import pandas as pd

# Load the datasets with specified data types to ensure IDs are read as strings
companies = pd.read_csv('processed_farma_companies.csv', dtype={'Company ID': str})
nace_codes = pd.read_csv('Nacebel-2008-FR-NL-DE-EN.csv', dtype={'CODE': str})

# Explicitly convert Company ID to string and remove any trailing decimal or zero
companies['Company ID'] = companies['Company ID'].apply(lambda x: x.rstrip('.0') if '.' in x else x)

# Create a dictionary to map NACE codes to their English descriptions
nace_dict = pd.Series(nace_codes['ENGELSE OMSCHRIJVING'].values, index=nace_codes['CODE']).to_dict()

# Function to get descriptions for each NACE code in the list and update the codes list
def update_activities_and_descriptions(nace_list):
    if pd.isna(nace_list):
        return 'No NACE codes', ''  # Handle NaN values by returning placeholders
    descriptions = []
    valid_codes = []  # Store valid codes only
    for code in nace_list.split(','):
        code = code.strip()  # Remove any leading/trailing whitespace
        if code in nace_dict:
            descriptions.append(nace_dict[code])
            valid_codes.append(code)
    return '; '.join(descriptions), ', '.join(valid_codes)

# Apply the function and split descriptions from codes
result = companies['Activities'].apply(update_activities_and_descriptions)
companies['NACE Descriptions'] = result.apply(lambda x: x[0])
companies['Activities'] = result.apply(lambda x: x[1])  # Update the 'Activities' column with filtered codes

# Save the updated DataFrame to a new CSV file, ensuring IDs remain as strings
companies.to_csv('updated_farma_companies_with_filtered_nace.csv', index=False)

# Print the first few rows to verify the output
print(companies.head())
