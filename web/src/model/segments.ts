import type { Segment } from "./contracts";

const names = [
  "Ascending aorta", "Aortic arch I", "Brachiocephalic", "R. subclavian I", "R. carotid",
  "R. vertebral", "R. subclavian II", "R. radius", "R. ulnar I", "Aortic arch II",
  "L. carotid", "Thoracic aorta I", "Thoracic aorta II", "Intercostals", "L. subclavian I",
  "L. vertebral", "L. subclavian II", "L. ulnar I", "L. radius", "Celiac I",
  "Celiac II", "Hepatic", "Splenic", "Gastric", "Abdominal aorta I",
  "Sup. mesenteric", "Abdominal aorta II", "R. renal", "Abdominal aorta III", "L. renal",
  "Abdominal aorta IV", "Inf. mesenteric", "Abdominal aorta V", "R. com. iliac", "R. ext. iliac",
  "R. int. iliac", "R. deep femoral", "R. femoral", "R. ext. carotid", "L. int. carotid",
  "R. post. tibial", "R. ant. tibial", "R. interosseous", "R. ulnar II", "L. ulnar II",
  "L. interosseous", "R. int. carotid", "L. ext. carotid", "L. com. iliac", "L. ext. iliac",
  "L. int. iliac", "L. deep femoral", "L. femoral", "L. post. tibial", "L. ant. tibial",
] as const;

export const SEGMENTS: Segment[] = names.map((name, i) => ({ index: i + 1, name }));

