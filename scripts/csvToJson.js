const fs = require("fs");
const { reduce, groupBy } = require("lodash");
const [fields, ...values] = fs.readFileSync("data.csv").toString().split("\r");
const splitFields = fields.split(",");
const objects = values.map((value) => {
  const valueAsArray = value.replace("\n", "").split(",");
  return reduce(
    splitFields,
    (acc, curr, i) => {
      const value = valueAsArray[i];
      if (value === "TRUE" || value === "FALSE") {
        acc[curr] = value === true;
      } else {
        acc[curr] = valueAsArray[i];
      }
      return acc;
    },
    {}
  );
});

const groupedByArea = groupBy(objects, (obj) => obj.area);
const withGroupedTypes = reduce(
  Object.entries(groupedByArea),
  (acc, curr) => {
    const [key, entries] = curr;
    console.log(key);
    const byType = Object.values(groupBy(entries, (entry) => entry.type));
    acc[key] = {
      name: key,
      link: key,
      groups: byType.map((items) => ({
        name: items[0].type,
        id: items[0].type,
        items: items.map(({ item, status, priority }) => ({
          name: item,
          status,
          priority,
        })),
      })),
    };

    return acc;
  },
  {}
);

const categoriesData = JSON.stringify(withGroupedTypes);

const entireFile = `
// This is an automatically generated file.
// Please do not adjust it without adjusting the script.
export type Status = "TEST" | "KEEP" | "ADOPT" | "TRIAL" | "HOLD";
export interface Item {
  name: string;
  status: Status;
  priority?: boolean;
}
export interface Group {
  name: string;
  id: string;
  items: Item[];
}
export interface Category {
  name: string;
  link: string;
  groups: Group[];
}

const categories: Record<string, Category> = ${categoriesData};

export default categories;
`;

fs.writeFileSync("./src/categories.ts", entireFile);
