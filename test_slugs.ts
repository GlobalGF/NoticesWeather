import { slugify } from "./lib/utils/slug";

const provinces = ["A Coruña", "Álava", "Alicante"];
provinces.forEach(p => {
    console.log(`'${p}' -> '${slugify(p)}'`);
});
