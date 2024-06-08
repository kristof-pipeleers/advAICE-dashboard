import pandas as pd

# Load data from CSV
df = pd.read_csv('farma_companies/updated_farma_companies.csv')

# Function to extract address components
def extract_address(full_address):
    parts = full_address.split(',')
    street_and_number = parts[0].strip().rsplit(' ', 1)
    street = street_and_number[0]
    number = street_and_number[1] if len(street_and_number) > 1 else ''
    city = parts[1].strip()
    country = parts[2].strip()
    return street, number, city, country

# Apply the function to extract address components
df['Street'], df['Number'], df['City'], df['Country'] = zip(*df['Full Address'].apply(extract_address))

# Function to split activities into multiple columns
def split_activities(activities):
    if pd.notna(activities):
        activity_list = str(activities).split(', ')
        return {f'Activity{i+1}': activity_list[i] for i in range(len(activity_list))}
    else:
        return {}

# Apply the function and join the result with the original dataframe
activities_df = df['Activities'].apply(split_activities).apply(pd.Series)
df = pd.concat([df, activities_df], axis=1)

# Save the modified dataframe to a new CSV file
df.to_csv('processed_farma_companies.csv', index=False)
