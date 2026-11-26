# NOTES — Feature Flag Editor

บันทึกการตัดสินใจทางเทคนิคของงานนี้ โค้ดทั้งหมดอยู่ที่ `src/pages/code-challenge/feature-flag-form/your-codes/`

```bash
pnpm install
pnpm dev     # http://localhost:3000/code-challenge/feature-flag-form
pnpm test    # 61 tests
```

## Key Requirements → ใช้ในโปรเจกต์อย่างไร

| Requirement         | ใช้อะไร                                                                                                       | ไฟล์หลัก                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Form Management** | `@tanstack/react-form`: `useForm`, `form.Field`, `mode="array"`, `form.Subscribe`                             | `use-flag-form.ts`, `components/**`                         |
| **Validation**      | `zod`: schema เดียวทั้งฟอร์ม (recursive) ต่อเข้าเป็น validator ของฟอร์ม                                       | `model/schema.ts`, `use-flag-form.ts`                       |
| **Live Preview**    | `form.Subscribe` → `toOutput()` → `@monaco-editor/react` (อ่านอย่างเดียว)                                     | `components/preview/json-preview.tsx`, `model/to-output.ts` |
| **Dynamic Fields**  | array field (`pushValue` / `removeValue` / `moveFieldValues`) ใน 3 ระดับ: variations, rules, group ที่ซ้อนกัน | `components/variations/`, `components/targeting/`           |

### 1. Form Management — `@tanstack/react-form`

- **สร้างฟอร์มที่เดียว**: `useFlagForm()` เรียก `useForm({ defaultValues, validators })` ค่าเริ่มต้นคือ `DEFAULT_FLAG` (= expected.json) แล้วส่ง `form` ลงไปให้ทุก section
- **`form.Field` ต่อ 1 input**: ทุกช่องผูกกับ path ของตัวเอง เช่น `name`, `variations[0].value`, `targeting[0].conditions.children[1].attribute`, `targeting[0].percentage` พิมพ์ช่องหนึ่งจึง render ใหม่เฉพาะช่องนั้น
- **`mode="array"`** สำหรับ list ทั้ง 3 ระดับ (variations, targeting, `children` ของ group) ทำให้ list render ใหม่เฉพาะตอนเพิ่ม/ลบ/ย้าย
- **`form.Subscribe` + selector** ใช้เฉพาะจุดที่ต้องอ่านค่าข้าม field:
  - JSON preview อ่านทั้งฟอร์ม และเป็นจุดเดียวที่ทำแบบนี้
  - query ใต้แต่ละ rule อ่านเฉพาะ rule ของตัวเอง
  - dropdown เลือก variation อ่านเฉพาะรายการ variations
  - ช่องกรอกค่า variation อ่านเฉพาะ flag type
- **`listeners.onChange`** บนช่อง flag type: เปลี่ยนชนิดแล้ว `setFieldValue` รีเซ็ตค่าของ variation ที่ใช้กับชนิดใหม่ไม่ได้
- **Nested form ลึกไม่จำกัด**: `ConditionGroup` render ตัวเองซ้ำตาม path ส่วน type ของฟอร์มรู้จัก group แค่ชั้นแรกเพื่อเลี่ยง TS2589 (อธิบายด้านล่าง)

### 2. Validation — `zod`

- **Schema เดียว** `flagFormSchema` ใน `model/schema.ts` ครอบคลุมทั้งฟอร์ม type ทั้งหมด (`Condition`, `Variation`, `Rule`, `FlagFormValues`) ได้จาก `z.infer` จึงไม่ต้องประกาศ type ซ้ำ
- **Recursive**: `groupSchema` ใช้ getter ของ zod 4 (`get children()`) จึง validate group ที่ซ้อนได้ทุกชั้น
- **ต่อเข้าฟอร์ม** ผ่าน `validators.onChange` (ใช้ `standardSchemaValidators` ของ TanStack) แล้ว TanStack กระจาย issue ไปที่ field ตาม path ให้เอง
- **กฎที่ตรวจ**:
  - Flag: ชื่อห้ามว่างและต้องเป็น kebab-case, คำอธิบายไม่เกิน 280 ตัว
  - Variations: ต้องมีอย่างน้อย 2 ตัว, ชื่อห้ามว่าง/ห้ามซ้ำ, ค่าต้องตรงกับ flag type (boolean / number / JSON ที่ parse ได้)
  - Rule: ต้องเลือก variation ที่ยังมีอยู่, rollout เป็นจำนวนเต็ม 0–100
  - Condition: attribute ห้ามว่างและต้องเป็นชื่อที่ถูกต้อง, value ห้ามว่าง (ยกเว้น operator "Is present")
  - Group: ห้ามว่าง
  - Default rule: ต้องเลือก variation ที่ยังมีอยู่
- **แสดงผล**: ใต้ช่องแสดง issue แรกพร้อมกรอบแดง (`aria-invalid` + `aria-describedby`) ส่วนใน preview มีสรุปจำนวนและตำแหน่ง เช่น `Rule 1 › Group 2 › Condition 1 › Value — Value is required`

### 3. Live Preview — `@monaco-editor/react`

- `JsonPreview` ใช้ `form.Subscribe(state => state.values)` ทุกครั้งที่ค่าเปลี่ยนจะ `toOutput()` → `JSON.stringify` → แสดงใน Monaco ทันที ตามคำแนะนำ (Tip) ในหน้าโจทย์
- "JSON Schema" ในโจทย์ตีความว่าเป็น **JSON output ของ flag ตาม expected.json** ไม่ใช่เอกสาร JSON Schema
- มี badge `Valid` / `N issues`, รายการ error ที่บอกตำแหน่ง และปุ่ม Copy
- ใต้แต่ละ rule แสดง query ที่คำนวณจาก group ทันทีด้วย
- เปิดหน้ามา output ตรงกับ expected.json (มี test ยืนยัน)

### 4. Dynamic Fields

| ระดับ                   | เพิ่ม                                            | ลบ                                        | อื่นๆ                                                                            |
| ----------------------- | ------------------------------------------------ | ----------------------------------------- | -------------------------------------------------------------------------------- |
| **Variations**          | ✅ ตั้งชื่อใหม่ไม่ซ้ำให้อัตโนมัติ                | ✅ (ต้องเหลืออย่างน้อย 2)                 | ช่องกรอกค่าเปลี่ยนตาม flag type, เปลี่ยนชื่อแล้ว rule ไม่หลุดเพราะอ้างด้วย id    |
| **Targeting Rules**     | ✅                                               | ✅                                        | ลากเรียงลำดับได้ (drag & drop / ↑↓), เลือก variation + rollout %                 |
| **Conditions / Groups** | ✅ "+ Condition" / "+ Group" ซ้อนได้ไม่จำกัดชั้น | ✅ (group ว่างจะขึ้น error ให้เติมหรือลบ) | AND / OR ต่อ group, operator 11 ตัวของ GoFeatureFlag, ลากเรียงในกลุ่มเดียวกันได้ |
| **Default rule**        | —                                                | —                                         | เลือก variation ที่ใช้เมื่อไม่มี rule ไหนตรง                                     |

### Test ที่ยืนยันแต่ละข้อ

| Requirement     | Test                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Form Management | `flag-editor.test.tsx`: input แสดงค่าจาก form state และพิมพ์แล้วค่าเปลี่ยน                                                            |
| Validation      | `schema.test.ts` (กฎทุกข้อรวม path ใน group ที่ซ้อน), `flag-editor.test.tsx` / `targeting-section.test.tsx` (error ขึ้นและหายถูกช่อง) |
| Live Preview    | `json-preview.test.tsx`: เท่ากับ expected.json, อัปเดตทันทีเมื่อแก้ชื่อ/สวิตช์/targeting, รายการ issue                                |
| Dynamic Fields  | `variations-section.test.tsx`, `targeting-section.test.tsx` (สร้าง rule ที่มี group ซ้อนตั้งแต่ต้น), `reorder.test.tsx`               |

## โครงสร้าง

```
your-codes/
├── model/              # Logic ล้วน ไม่มี React — ทดสอบได้โดยไม่ต้อง render
│   ├── schema.ts         Zod schema ของทั้งฟอร์ม (recursive) + type ที่ infer ได้
│   ├── build-query.ts    tree ของเงื่อนไข → query string ของ GoFeatureFlag
│   ├── to-output.ts      ค่าในฟอร์ม → JSON output
│   ├── describe-path.ts  path ของ error → "Rule 1 › Group 2 › Value"
│   ├── operators.ts      operator ของ query language
│   └── defaults.ts       ค่าเริ่มต้น (= expected.json) และ factory ของ rule/group/condition/variation
├── components/         # UI — อ่าน/เขียนผ่าน form เท่านั้น
│   ├── metadata-section, variations/, targeting/, default-rule-section
│   ├── preview/          Monaco JSON preview + สรุป error
│   └── reorder/          drag & drop + คีย์บอร์ด
├── use-flag-form.ts    # สร้างฟอร์มจุดเดียว (useForm + validator)
└── test-utils.ts
```

เพิ่มกฎใหม่ เช่น operator ใหม่ ทำได้ที่ `model/operators.ts` ที่เดียว ทั้ง dropdown, validation และ query จะอ่านจากที่นี่

## การตัดสินใจหลัก

### Output ตาม expected.json ไม่ใช่ format จริงของ GoFeatureFlag

ผมเปิด GoFeatureFlag editor จริงเทียบแล้ว output ต่างจาก expected.json ของโจทย์:

|            | expected.json (ที่ใช้)                | GoFeatureFlag จริง                      |
| ---------- | ------------------------------------- | --------------------------------------- |
| ระดับบนสุด | `{ "flags": { … } }`                  | `{ "<flag>": { … } }`                   |
| query      | `group == 'beta'`                     | `group eq "beta"`                       |
| percentage | `"percentage": 50, "variation": "on"` | `"percentage": { "on": 50, "off": 50 }` |

เลือกทำตามโจทย์ ส่วน field ของฟอร์ม (flag type, AND/OR, +Condition/+Group, drag handle, รายการ operator) ทำให้เหมือน GoFeatureFlag
`disable: true` และ `metadata.description` ใส่เฉพาะเมื่อมีค่า ทำให้ output เริ่มต้นตรงกับ expected.json ทุกตัวอักษร (มี test ยืนยัน)

### Targeting เป็น tree ในฟอร์ม ส่วน query คำนวณจาก tree

ฟอร์มเก็บ `Group { combinator, children: (Condition | Group)[] }` ซ้อนได้ไม่จำกัด แล้ว `buildQuery()` แปลงเป็น string ตอนแสดงผล ไม่เก็บ string ไว้ในฟอร์ม ทำให้แก้เงื่อนไขทีละช่องได้และ validate ได้ทุกชั้น

- group ที่ซ้อนจะมีวงเล็บเสมอ, condition ที่ยังไม่มี attribute และ group ว่างจะถูกข้าม
- ตัวเลข / `true` / `false` ไม่ใส่ quote, ค่าอื่นใส่ `'…'` และ escape `'`
- Role ใช้เป็นเงื่อนไข เช่น `role in ['admin', 'editor']` (มี attribute แนะนำ: key, group, role, email, country, plan, env)

### Rule อ้าง variation ด้วย id ไม่ใช่ชื่อ

เปลี่ยนชื่อ variation แล้ว rule ไม่หลุด ถ้าลบ variation ที่ถูกใช้อยู่ schema จะแจ้ง error ที่ rule นั้น ชื่อจะถูกแปลงจาก id ตอนสร้าง output

### Zod schema เดียวสำหรับทั้งฟอร์ม

`flagFormSchema` เป็น validator ระดับฟอร์ม (`onChange`) แล้ว TanStack Form กระจาย issue ไปตาม path ของแต่ละ field เอง รวมถึง field ใน group ที่ซ้อนกัน กฎข้าม field (ชื่อ variation ซ้ำ, ค่าไม่ตรงกับ flag type, variation ที่ถูกลบ) อยู่ใน `superRefine` ที่เดียว

schema ถูกห่อด้วยฟังก์ชัน (`standardSchemaValidators.validate`) แทนการส่ง schema ตรงๆ เพราะ TanStack Form Devtools ใน `__root.tsx` ทำ `JSON.stringify` กับ option ของฟอร์ม และ zod schema แบบ recursive เป็น object ที่อ้างถึงตัวเอง ทำให้ dev server พัง พฤติกรรมยังเหมือนเดิมเพราะเป็นฟังก์ชันเดียวกับที่ TanStack ใช้ภายใน

### Type ของฟอร์มรู้จัก group แค่ชั้นแรก

`DeepKeys` ของ TanStack Form ไล่ type แบบ recursive ไม่จบ (TS2589) และหยุดเมื่อเจอ `unknown` เท่านั้น จึงให้ `FlagFormData` รู้จัก group ชั้นแรก ส่วนชั้นที่ลึกกว่าใช้ path type ของชั้นแรก (`asGroupPath` ใน `targeting/paths.ts`) ได้เพราะทุกชั้นมีรูปแบบเดียวกัน ค่าตอนรันยังเป็น tree เต็ม และแปลงกลับเป็น domain type ที่จุดเดียวคือ `asFlagValues`

### ลด re-render

- ทุก input เป็น `form.Field` ของตัวเอง พิมพ์ช่องหนึ่ง render ใหม่แค่ช่องนั้น
- list ใช้ `mode="array"` ซึ่ง render ใหม่เฉพาะตอนเพิ่ม/ลบ/ย้าย
- มีเพียง preview ที่ subscribe ทั้งฟอร์ม (`form.Subscribe`) ส่วน query ของแต่ละ rule subscribe เฉพาะ rule ของตัวเอง

### `key={index}` ใน array ไม่ใช่ `key={id}`

ตั้งใจใช้ index ตาม pattern ในเอกสารของ TanStack Form: ถ้าใช้ id เมื่อลบ item ที่ไม่ใช่ตัวสุดท้าย component เดิมจะถูกย้ายไป path ใหม่ แล้วอ่านค่าจาก path ที่ถูกลบไปแล้วใน render รอบนั้นจน crash มี test สำหรับทั้ง rule และ group ที่ fail ก่อนแก้

### Drag & drop ใช้ HTML5 ของเบราว์เซอร์ ไม่เพิ่ม library

- เรียงได้ทั้ง rule และ condition/group ภายใน group เดียวกัน (`moveFieldValues`)
- ลากได้เฉพาะตอนจับไอคอน ⋮⋮ จึงยังเลือกข้อความใน input ได้
- แต่ละ list จำ drag ของตัวเอง การลาก condition จึงไม่ไปย้าย rule
- ใช้คีย์บอร์ดได้: focus ที่ ⋮⋮ แล้วกด ↑ / ↓ และ focus จะย้ายตาม item

### การแจ้ง error

- ใต้ช่องแสดง issue แรกของช่องนั้น (เช่น "required" ก่อน "format") ผูกกับ `aria-invalid` และ `aria-describedby`
- preview มี badge `Valid` หรือ `N issues` และรายการที่บอกตำแหน่งเป็นภาษาคน เช่น `Rule 1 › Group 2 › Condition 1 › Value — Value is required`
- condition ที่เพิ่งกดเพิ่มจะยังไม่ขึ้นสีแดงจนกว่าจะเริ่มกรอก

### UX อื่นๆ

- เปลี่ยน flag type แล้วค่าของ variation ที่ใช้กับชนิดใหม่ไม่ได้จะถูกรีเซ็ตเป็นค่าเริ่มต้นของชนิดนั้น ค่าที่ยังใช้ได้คงไว้
- variation ต้องมีอย่างน้อย 2 ตัว (ปุ่มลบจะใช้ไม่ได้) และชื่อใหม่จะไม่ซ้ำ
- แถวของ condition ใช้ container query จึงเปลี่ยนรูปแบบตามความกว้างของ group ไม่ใช่ความกว้างของหน้าจอ เพราะ group ที่ซ้อนจะแคบลงเรื่อยๆ

## สิ่งที่แก้นอก `your-codes/`

| ไฟล์                                                        | เหตุผล                                                                                                                                                                                                   |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/styles.css`                                            | บั๊กเดิม: `--color-*` อยู่ใน `:root` แทน `@theme inline` ทำให้ class อย่าง `bg-card`, `bg-primary` ไม่ถูกสร้าง และโหมดสว่างไม่มีค่าสี จึงย้ายเข้า `@theme inline` และเพิ่มค่าโหมดสว่างตาม shadcn neutral |
| `src/components/ui/{card,label,select,switch,textarea}.tsx` | เพิ่มจาก shadcn (แก้ import ให้ใช้ `#/lib/utils` แบบ component เดิม)                                                                                                                                     |
| `vitest.config.ts`                                          | test ใช้แค่ plugin `react` + `tsconfigPaths` เพราะ plugin ของ TanStack Start ทำให้ component ที่เรียก hook โหลด React คนละ instance                                                                      |
| `.gitignore`                                                | เพิ่ม `.serena`                                                                                                                                                                                          |
| `src/components/app-sidebar.tsx`                            | ลบ import ที่ไม่ได้ใช้ ซึ่งเป็น error เดียวของ `tsc` ใน repo                                                                                                                                             |
| `src/lib/utils.ts`                                          | แยก `type` import ออกมา ซึ่งเป็น error เดียวของ lint ใน repo                                                                                                                                             |

## สิ่งที่ไม่ได้ทำ / ข้อจำกัด

- **หลาย flag**: โจทย์และเกณฑ์ไม่ได้ขอ แต่ output เป็น map `flags` อยู่แล้ว จึงขยายได้
- **Progressive rollout** และ **percentage แบบแบ่งหลาย variation**: ไม่มีใน expected.json
- **ย้าย condition ข้าม group** และ **ลากบนมือถือ** (HTML5 drag & drop ใช้กับ touch ไม่ได้ บนจอแคบจึงซ่อน ⋮⋮ ของ condition)
- **ไม่บันทึกข้อมูล**: ข้อมูลอยู่ใน state ของฟอร์มเท่านั้น รีเฟรชแล้วกลับเป็นค่าเริ่มต้น นำออกได้ด้วยปุ่ม Copy
- **Monaco โหลดจาก CDN** (ค่าเริ่มต้นของ `@monaco-editor/react`) ถ้าไม่มีอินเทอร์เน็ตจะค้างที่ "Loading editor…"
- **`pnpm lint` ต้องติดตั้ง eslint ก่อน**: template มี config และ script แต่ไม่มี `eslint` ใน devDependencies ผมตั้งใจไม่เพิ่ม dependency แต่ตรวจด้วย eslint 9 แบบชั่วคราวแล้ว และ `pnpm lint` ผ่านทั้ง repo ถ้าจะรันเอง: `pnpm add -D eslint@^9 && pnpm lint`

## Tests

61 tests (Vitest + Testing Library) ทดสอบจากมุมของผู้ใช้ ไม่ได้ทดสอบ implementation:

- `model/*.test.ts`: schema, query, output (เทียบกับ expected.json), describe-path
- `components/**/*.test.tsx`: render `FlagEditor` ทั้งก้อนแล้วกรอก/คลิก/ลาก เช่น สร้าง rule ที่มี group ซ้อนตั้งแต่ต้น, ลบ item ตรงกลาง, เปลี่ยนชื่อหรือลบ variation, preview อัปเดตทันที
- Mock เฉพาะขอบเขตภายนอก: Monaco (โหลดจาก CDN) และ browser API ที่ jsdom ไม่มี (`ResizeObserver`, `scrollIntoView`, `DataTransfer`)
