// src/utils/consts.js
export const elements = ['Ceiling', 'Wall', 'Beam', 'Column']
export const objects = [
  'bottom-reinforcement',
  'top-reinforcement',
  'closing-reinforcement',
  'Openings',
  'Electrics',
  'Plumbing',
  'Concrete',
]
export const languages = ['en', 'he', 'ar']

export const FILE_TYPES_AP = {
  'AP table (.csv)': 'AP table (.csv)',
  'AP design (.dwg)': 'AP design (.dwg)',
  'Thresholds (.csv)': 'Thresholds (.csv)',
  'AP set images (.jpg/.jpeg/.png)': 'AP set images (.jpg/.jpeg/.png)',
}

export const FILE_TYPES_AP_VALIDATION = {
  'AP table (.csv)': ['text/csv'],
  'AP design (.dwg)': ['application/dwg', 'application/x-dwg'],
  'Thresholds (.csv)': ['text/csv'],
  'AP set images (.jpg/.jpeg/.png)': ['image/jpeg', 'image/jpg', 'image/png'],
}

export const FILE_TYPES_AB = {
  'As Built Table(txt)': 'As Built Table(txt)',
}

export const FILE_TYPES_AB_VALIDATION = {
  'As Built Table(txt)': ['text/plain'],
}

export const HIERARCHY_LABELS = {
  client: 'Client',
  project: 'Project',
  floor: 'Floor',
  element: 'Element',
  object: 'Object',
  date: 'Date',
  fileType: 'File Type',
}

export const S3_BUCKET_NAME = 'atom-construction-bucket-eu'
// export const S3_BUCKET_ORTHOPHOTO = 'prod-drone-yard-droneyard-dronephotosbucket1549df6-1xcxnmmtvojj'
export const S3_BUCKET_ORTHOPHOTO = 'ec2-orthophoto-raw'
