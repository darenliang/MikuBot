"""This framework file contains functions to with COVID19 data"""

from fuzzywuzzy import fuzz

LANGS = {'Afghanistan': 'AF', 'Albania': 'AL', 'Algeria': 'DZ', 'Andorra': 'AD', 'Angola': 'AO',
         'Antigua and Barbuda': 'AG', 'Argentina': 'AR', 'Armenia': 'AM', 'Australia': 'AU', 'Austria': 'AT',
         'Azerbaijan': 'AZ', 'Bahamas': 'BS', 'Bahrain': 'BH', 'Bangladesh': 'BD', 'Barbados': 'BB', 'Belarus': 'BY',
         'Belgium': 'BE', 'Benin': 'BJ', 'Bhutan': 'BT', 'Bolivia': 'BO', 'Bosnia and Herzegovina': 'BA',
         'Brazil': 'BR', 'Brunei': 'BN', 'Bulgaria': 'BG', 'Burkina Faso': 'BF', 'Cabo Verde': 'CV', 'Cambodia': 'KH',
         'Cameroon': 'CM', 'Canada': 'CA', 'Central African Republic': 'CF', 'Chad': 'TD', 'Chile': 'CL', 'China': 'CN',
         'Colombia': 'CO', 'Congo (Brazzaville)': 'CG', 'Congo (Kinshasa)': 'CD', 'Costa Rica': 'CR',
         "Cote d'Ivoire": 'CI', 'Croatia': 'HR', 'Diamond Princess': 'XX', 'Cuba': 'CU', 'Cyprus': 'CY',
         'Czechia': 'CZ', 'Denmark': 'DK', 'Djibouti': 'DJ', 'Dominican Republic': 'DO', 'Ecuador': 'EC', 'Egypt': 'EG',
         'El Salvador': 'SV', 'Equatorial Guinea': 'GQ', 'Eritrea': 'ER', 'Estonia': 'EE', 'Eswatini': 'SZ',
         'Ethiopia': 'ET', 'Fiji': 'FJ', 'Finland': 'FI', 'France': 'FR', 'Gabon': 'GA', 'Gambia': 'GM',
         'Georgia': 'GE', 'Germany': 'DE', 'Ghana': 'GH', 'Greece': 'GR', 'Guatemala': 'GT', 'Guinea': 'GN',
         'Guyana': 'GY', 'Haiti': 'HT', 'Holy See': 'VA', 'Honduras': 'HN', 'Hungary': 'HU', 'Iceland': 'IS',
         'India': 'IN', 'Indonesia': 'ID', 'Iran': 'IR', 'Iraq': 'IQ', 'Ireland': 'IE', 'Israel': 'IL', 'Italy': 'IT',
         'Jamaica': 'JM', 'Japan': 'JP', 'Jordan': 'JO', 'Kazakhstan': 'KZ', 'Kenya': 'KE', 'Korea, South': 'KR',
         'Kuwait': 'KW', 'Kyrgyzstan': 'KG', 'Latvia': 'LV', 'Lebanon': 'LB', 'Liberia': 'LR', 'Liechtenstein': 'LI',
         'Lithuania': 'LT', 'Luxembourg': 'LU', 'Madagascar': 'MG', 'Malaysia': 'MY', 'Maldives': 'MV', 'Malta': 'MT',
         'Mauritania': 'MR', 'Mauritius': 'MU', 'Mexico': 'MX', 'Moldova': 'MD', 'Monaco': 'MC', 'Mongolia': 'MN',
         'Montenegro': 'ME', 'Morocco': 'MA', 'Namibia': 'NA', 'Nepal': 'NP', 'Netherlands': 'NL', 'New Zealand': 'NZ',
         'Nicaragua': 'NI', 'Niger': 'NE', 'Nigeria': 'NG', 'North Macedonia': 'MK', 'Norway': 'NO', 'Oman': 'OM',
         'Pakistan': 'PK', 'Panama': 'PA', 'Papua New Guinea': 'PG', 'Paraguay': 'PY', 'Peru': 'PE',
         'Philippines': 'PH', 'Poland': 'PL', 'Portugal': 'PT', 'Qatar': 'QA', 'Romania': 'RO', 'Russia': 'RU',
         'Rwanda': 'RW', 'Saint Lucia': 'LC', 'Saint Vincent and the Grenadines': 'VC', 'San Marino': 'SM',
         'Saudi Arabia': 'SA', 'Senegal': 'SN', 'Serbia': 'RS', 'Seychelles': 'SC', 'Singapore': 'SG', 'Slovakia': 'SK',
         'Slovenia': 'SI', 'Somalia': 'SO', 'South Africa': 'ZA', 'Spain': 'ES', 'Sri Lanka': 'LK', 'Sudan': 'SD',
         'Suriname': 'SR', 'Sweden': 'SE', 'Switzerland': 'CH', 'Taiwan*': 'TW', 'Tanzania': 'TZ', 'Thailand': 'TH',
         'Togo': 'TG', 'Trinidad and Tobago': 'TT', 'Tunisia': 'TN', 'Turkey': 'TR', 'Uganda': 'UG', 'Ukraine': 'UA',
         'United Arab Emirates': 'AE', 'United Kingdom': 'GB', 'Uruguay': 'UY', 'US': 'US', 'Uzbekistan': 'UZ',
         'Venezuela': 'VE', 'Vietnam': 'VN', 'Zambia': 'ZM', 'Zimbabwe': 'ZW', 'Dominica': 'DM', 'Grenada': 'GD',
         'Mozambique': 'MZ', 'Syria': 'SY', 'Timor-Leste': 'TL', 'Belize': 'BZ', 'Laos': 'LA', 'Libya': 'LY',
         'West Bank and Gaza': 'XX', 'Guinea-Bissau': 'GW', 'Mali': 'ML', 'Saint Kitts and Nevis': 'KN', 'Kosovo': 'XK'}


def get_language_code(search):
    """Get language code"""
    search = search.capitalize()
    max_factor = -1
    max_language = None
    for language in LANGS:
        factor = fuzz.partial_ratio(search, language)
        if factor > max_factor:
            max_factor = factor
            max_language = language
    return LANGS[max_language]
