// Factory data types for Thai factory information

export type FactoryProperties = {
  เลขทะเบียน: string;
  ชื่อโรงงาน: string;
  ผู้ประกอบก: string;
  ประกอบกิจก: string;
  ละติจูด: number;
  ลองติจูด: number;
  โทรศัพท์: string;
  อำเภอ: string;
  ที่ตั้ง: string;
  การลงทุน: string;
  จำนวนคน: string;
  hp: string;
  kw: string;
  ประเภท: string;
};

export type FactoryFeature = {
  type: "Feature";
  properties: FactoryProperties;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
};

export type FactoryGeoJSON = {
  type: "FeatureCollection";
  features: FactoryFeature[];
};

export type UserLocation = {
  lat: number;
  lng: number;
};

export type FilterState = {
  searchTerm: string;
  factoryTypes: string[];
  districts: string[];
  showOnlyInRadius: boolean;
  showHighRisk: boolean;
};

// High-risk factory type codes based on impact criteria
export const HIGH_RISK_FACTORY_TYPES = [
  "10100",
  "10500",
  "10600",
  "05309",
  "05305",
  "05900",
  "06000",
  "08802",
  "03801",
  "03802",
  "02202",
  "05004",
  "04201",
];

// High-risk factory classification criteria (Thai)
export const HIGH_RISK_CRITERIA =
  "เกณฑ์การจัดให้เป็นโรงงานระดับความเสี่ยงสูง คือ อาจก่อผลกระทบอย่างรุนแรงในวงกว้าง และเมื่อมีผลกระทบแล้วยากต่อการฟื้นฟูให้กลับสู่สภาพปกติ โดยกลุ่มภาคประชาชนชาวปราจีนบุรี";
