// Default profile images - these should be in the public folder
const DEFAULT_PROFILE_IMAGES = [
    "/profiles/default-1.JPG",
    "/profiles/default-2.JPG",
    "/profiles/default-3.JPG",
    "/profiles/default-4.JPG",
    "/profiles/default-5.JPG",
  ];
  
  // Get a random profile image from the defaults
  export function getRandomProfileImage(): string {
    const randomIndex = Math.floor(Math.random() * DEFAULT_PROFILE_IMAGES.length);
    return DEFAULT_PROFILE_IMAGES[randomIndex];
  }
  
  // Company logo mapping - these should be in the public folder
  const COMPANY_LOGOS: Record<string, string> = {
    microsoft: "/companies/microsoft.png",
    google: "/companies/google.PNG",
    amazon: "/companies/amazon.png",
    apple: "/companies/apple.png",
    meta: "/companies/meta.png",
    facebook: "/companies/meta.png", // Alias for Meta
    netflix: "/companies/netflix.png",
    tesla: "/companies/tesla.png",
    bel: "/companies/BEL.PNG",
    ibm: "/companies/ibm.png",
    onix: "/companies/onix.JPG",
    intel: "/companies/intel.png",
    adobe: "/companies/adobe.JPG",
    "cimpress technology": "/companies/cimpress.png",
    BNY: "/companies/BNY.png",
    "hcl": "/companies/hcl.png",
    
    claudera: "/companies/cloudera.png",
    Nvidia: "/companies/nvidia.png",
    oracle: "/companies/oracle.JPG",
    salesforce: "/companies/salesforce.png",
    twitter: "/companies/twitter.png",
    uber: "/companies/uber.png",
    airbnb: "/companies/airbnb.png",
    spotify: "/companies/spotify.png",
    samsung: "/companies/samsung.png",
    tcs: "/companies/tcs.png",
    infosys: "/companies/infosys.png",
    wipro: "/companies/wipro.png",
    cognizant: "/companies/cognizant.png",
    accenture: "/companies/accenture.png",
    capgemini: "/companies/capgemini.png",
    deloitte: "/companies/deloitte.png",
    pwc: "/companies/pwc.png",
    kpmg: "/companies/kpmg.png",
    juspay: "/companies/juspay.JPG",
    ey: "/companies/ey.png",
    zscaler: "/companies/zscaler.PNG",
    
    "goldman sachs": "/companies/goldman-sachs.png",
    jpmorgan: "/companies/jpmorgan.png",
    "morgan stanley": "/companies/morgan-stanley.png",
  };
  
  // Get company logo or default
  export function getCompanyLogo(companyName: string): string {
    if (!companyName) return "/companies/company.png";
    
    // Normalize company name for lookup
    const normalizedName = companyName.toLowerCase().trim();
    
    // Check for exact match
    if (COMPANY_LOGOS[normalizedName]) {
      return COMPANY_LOGOS[normalizedName];
    }
    
    // Check for partial matches
    for (const [key, logo] of Object.entries(COMPANY_LOGOS)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return logo;
      }
    }
    
    // Generate a default logo with the first letter of the company
    const firstLetter = normalizedName.charAt(0).toLowerCase();
    return "/companies/company.png";
  }
  
  // Generate a consistent color for a company based on its name
  export function getCompanyColor(companyName: string): string {
    if (!companyName) return "#f4f4f5"; // Default gray
    
    // Simple hash function to generate a consistent number from a string
    let hash = 0;
    for (let i = 0; i < companyName.length; i++) {
      hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to a hex color with good saturation and lightness
    const h = Math.abs(hash) % 360; // Hue: 0-359
    const s = 65 + (Math.abs(hash) % 20); // Saturation: 65-85%
    const l = 75 + (Math.abs(hash) % 10); // Lightness: 75-85%
    
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  