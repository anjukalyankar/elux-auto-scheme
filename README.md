# Power Design Pro

ELEXORA – Electrical Engineering Automation Platform

1. PRODUCT VISION

Build a professional web-based engineering automation application called ELEXORA.

ELEXORA is an electrical engineering automation tool designed primarily for switchgear/panel engineering, feeder engineering, extension-panel engineering, BOM generation, and automatic electrical schematic generation.

The first version must focus on NEW FEEDER / NEW EXTENSION PANEL DESIGN WITHOUT AN EXISTING REFERENCE DRAWING.

The future version will support RETROFIT ENGINEERING, where an existing customer drawing in PDF, image, DWG or DXF format can be uploaded, interpreted, modified according to engineering instructions, and converted into a retrofit BOM and modified drawing.

Do NOT make retrofit drawing interpretation the first MVP. Build the new-design engine first, but design the architecture so retrofit can be added later.

2. PRIMARY MVP GOAL

The MVP workflow must be:

USER INPUT
→ ENGINEERING RULE ENGINE
→ ENGINEERING MODEL
→ MATERIAL SELECTION
→ BOM GENERATION
→ SCHEMATIC GENERATION

The user should NOT have to manually select every component.

The user should enter engineering parameters and ELEXORA should determine the required components using engineering rules.

Example:

Feeder Type = MOTOR
Voltage = 6.6 kV
Motor Power = 800 kW
Breaker = VCB
Relay = 7SJ66
Phase CT = 100/1A
CBCT = 50/5A
Control Voltage = 110V DC
67N = YES

The system should automatically determine the required components such as:

Breaker

CTs

CBCT

Protection relay

Indication lamps

TNC switch

Local/Remote switch

Ammeter/MFM

Fuses/MCBs

Terminal blocks

Auxiliary relays

Other components according to engineering rules

The same engineering result must be used to generate BOTH:

BOM

Electrical schematic

Do not maintain separate independent logic for BOM and schematic.

3. CORE ARCHITECTURE

Use this architecture:

USER INPUT
↓
ENGINEERING RULE ENGINE
↓
ENGINEERING MODEL
↓
┌─────────────────────┬──────────────────────┐
│ │ │
BOM ENGINE SCHEMATIC ENGINE VALIDATION ENGINE
│ │
↓ ↓
BOM Excel Electrical Drawing

The ENGINEERING MODEL is the central source of truth.

The BOM engine and schematic engine must consume the same engineering model.

4. APPLICATION MODULES

Create the following main modules/pages.

Dashboard

Show:

New Design

Extension Panel

BOM Generator

Schematic Generator

Engineering Rules

Material Master

Projects

Settings

5. NEW DESIGN MODULE

Create a wizard-style engineering input form.

Step 1 – Project Information

Fields:

Project Name

Customer

Project Number

Panel Number

Revision

Engineer

Date

Remarks

Step 2 – Feeder Information

Fields:

Feeder Type

Panel Type

Incoming/Outgoing

Voltage Level

Frequency

Rated Current

Motor Power where applicable

Transformer Rating where applicable

Breaker Type

Breaker Rating

Feeder types should initially support:

Motor

Transformer

Incoming

Outgoing Feeder

Bus Coupler

Architecture must allow additional feeder types later.

6. PROTECTION INPUTS

Allow selection of protection functions.

Examples:

50

51

50N

51N

67

67N

46

49

27

59

87

Other project-specific functions

The selected protection functions must influence material selection and schematic generation.

Example:

IF 67N = YES:

The engineering model should identify the requirement for:

Earth-fault current measurement

CBCT or residual current input according to project philosophy

Polarizing/residual voltage where required

Relay 67N function

Associated wiring and terminals

Do NOT hard-code unsupported electrical assumptions. Engineering rules must be configurable.

7. CT / VT INPUTS

Allow the engineer to enter:

Phase CT ratio

CT secondary: 1A / 5A

CT class

CT VA

CT protection class

CBCT ratio

CBCT secondary

VT ratio

VT secondary

Residual voltage source

CT/VT quantity

Example:

Phase CT = 100/1A
CBCT = 50/5A
Relay current input = 1A

The application must NOT automatically assume compatibility.

It must validate the selected CT/CBCT against relay input requirements and show a warning if incompatible.

Example warning:

"CBCT secondary is 5A but selected relay earth-current input is 1A. Engineering review required."

Never silently change an engineering value.

8. RELAY SELECTION

Allow relay selection from a relay master database.

Each relay should contain:

Material ID

Material Code

Manufacturer

Model

Rated input current

Auxiliary supply

Protection functions

Binary inputs

Binary outputs

Communication

Symbol ID

Terminal template

Unit price

Example relay:

Siemens 7SJ66 / 7SJ6622

The system must use the selected relay's actual stored engineering data.

9. CONTROL CIRCUIT INPUTS

Allow:

Control voltage

AC/DC

Close circuit required

Trip circuit required

Local/Remote required

TNC switch required

CB ON indication

CB OFF indication

Trip indication

Spring charged indication

Service/Test indication

Other project-specific indications

Example:

Control voltage = 110V DC

Then ELEXORA should select compatible 110V DC lamps/coils/components according to the material master.

Do NOT simply change manufacturer/model based on voltage.

Material selection must be based on engineering properties.

10. DESIGN OPTIONS

Support:

Standard

Enhanced

Premium

The options must represent different engineering feature sets.

They must NOT simply mean different manufacturers.

Example:

STANDARD:

Standard relay

Basic indications

Standard metering

ENHANCED:

Additional monitoring

Digital metering

Additional indications

PREMIUM:

Enhanced relay

Additional digital metering

Additional binary inputs/outputs

Communication

Conformal coating where applicable

Additional monitoring/features

The option architecture must be data-driven so features can be added later.

11. EXTENSION PANEL MODULE

Create a separate Extension Panel workflow.

Inputs should include:

Existing panel number

New extension panel number

Existing busbar size

Extension busbar size

Voltage

Rated current

Number of new feeders

Feeder type

Breaker type

Relay

CT/VT details

Control voltage

Protection functions

Panel dimensions

Cable entry

Customer-specific requirements

The extension panel should use the selected feeder engineering philosophy and generate:

Extension panel BOM

Feeder schematic

Extension-panel information

Required interconnections

Engineering warnings

Initially, existing-board philosophy can be entered manually.

Do NOT require an existing drawing for the first version.

12. MATERIAL MASTER

Create a proper material master.

Core fields:

Material ID

Material Code

Category

Description

Manufacturer

Model

Unit

Unit Price

Component Type

Symbol ID

Terminal Template ID

Rated Voltage

Rated Current

Active

Do not put every possible engineering property into the core material table.

Use separate detail tables for specialized components.

Create detail structures for:

Relay

CT

CBCT

Breaker

Switch

Lamp

Meter

Fuse/MCB

Terminal Block

13. ENGINEERING RULE ENGINE

The rule engine is the heart of ELEXORA.

Rules must support:

AND conditions

OR conditions

Numeric comparisons

Range checks

Selection-based conditions

Feature-based conditions

Material compatibility

Rule priority

Rule conflicts

Rule validation

Example:

IF:
Feeder Type = MOTOR
AND Breaker = YES
AND Control Voltage = 110VDC

THEN:
Add CB ON lamp
Add CB OFF lamp
Add Trip lamp
Add TNC switch

Another example:

IF:
Protection = 67N

THEN:
Add required earth-fault measurement components
Add required voltage/polarizing source if applicable
Enable 67N schematic section

Rules must be editable through an admin/rule-management interface.

Do not bury engineering rules inside frontend code.

14. ENGINEERING MODEL

Create a normalized engineering model after rules execute.

Example:

Project
→ Panel
→ Feeder
→ Breaker
→ CT
→ CBCT
→ Relay
→ Protection Functions
→ Control Components
→ Indications
→ Terminals
→ Connections

Every selected component should have:

Component ID

Material ID

Tag

Function

Quantity

Location

Symbol ID

Terminal template

Electrical properties

This engineering model is the source of truth for both BOM and schematic.

15. SCHEMATIC GENERATOR

Create an automatic schematic generator.

Do NOT attempt to clone EPLAN.

Use predefined engineering templates.

Initially support one complete feeder template, preferably:

MOTOR FEEDER.

The schematic should contain configurable sections:

Power circuit

CT circuit

Protection relay circuit

Trip circuit

Close circuit

Breaker auxiliary circuit

Indication circuit

Control supply

67N circuit

Terminal section

The drawing engine should place symbols and generate connections based on the engineering model.

16. SYMBOL MASTER

Create:

Symbol ID

Component Type

Symbol Name

Symbol file/reference

Pin definitions

Orientation

Connection points

Initial symbols:

Breaker

CT

CBCT

Relay

Lamp

Fuse

MCB

Switch

TNC

Local/Remote switch

Terminal block

Auxiliary relay

Motor

Busbar

VT

Use a drawing format that can be exported and later integrated with CAD/EPLAN workflows.

Do not claim native EPLAN compatibility unless actually implemented.

17. TERMINAL / CONNECTION MASTER

Every schematic component must have defined connection points.

Example:

Relay:

A1

A2

Current input terminals

Binary input terminals

Binary output terminals

Breaker:

Trip coil

Close coil

Auxiliary contacts

Spring charged

Service/Test contacts

TNC:

Common

Close

Trip

The system must use these definitions to automatically create valid connections.

18. BOM GENERATOR

Generate BOM automatically from the engineering model.

Columns:

Material Code

Description

Manufacturer

Model

Unit

Quantity

Unit Price

Total Price

Category

Summary:

Total Components

Total Quantity

Total BOM Cost

Allow export to Excel.

BOM must reflect actual selected material variants.

19. BOM VALIDATION

Before generating final BOM, run checks:

Missing material

Missing price

Duplicate material

Invalid quantity

CT/relay mismatch

Voltage mismatch

Missing required protection component

Missing symbol

Missing terminal template

Missing connection

Conflicting rules

Display errors and warnings separately.

Do not generate a "final engineering approved" result if critical validation errors exist.

20. SCHEMATIC VALIDATION

Before export:

Check:

Unconnected terminals

Missing breaker trip circuit

Missing close circuit

Missing control supply

Missing relay input

Missing CT connection

Missing CBCT connection

Missing indication connection

Duplicate tags

Missing component symbols

Show a validation report.

21. PROJECT MANAGEMENT

Projects should be saved.

Each project must store:

Project information

Input parameters

Selected options

Engineering model

Rule results

BOM

Schematic data

Revision

Validation results

Support revisions such as:

REV 0
REV 1
REV 2

22. USER INTERFACE

The UI must look like a professional engineering application, NOT a generic AI website.

Use:

Desktop-first design

Clean engineering dashboard

Left navigation

Project workspace

Step-by-step engineering wizard

Tables

Validation panels

BOM preview

Schematic preview

Rule editor

Master-data editor

Use a professional industrial/electrical engineering visual style.

Avoid excessive animations.

Prioritize usability and accuracy.

23. IMPORTANT ENGINEERING SAFETY RULE

ELEXORA is an engineering automation assistant.

It must NEVER silently invent engineering values.

If required information is missing, show:

"Engineering input required."

If a rule cannot determine the correct component:

"Engineering review required."

If two rules conflict:

"Rule conflict detected."

If a selected component is incompatible:

"Compatibility warning."

Never fabricate CT ratios, protection settings, cable sizes, breaker ratings, or other engineering values.

24. TECHNOLOGY

Build a modern full-stack web application.

Preferred:

Frontend:
React + TypeScript

Backend:
Python FastAPI OR Node.js

Database:
PostgreSQL

Use a clean API architecture.

The application must be modular so the engineering rule engine is independent of the UI.

Use structured JSON for the engineering model.

Use database-backed master data.

Do not hard-code all materials and engineering rules into the frontend.

25. MVP IMPLEMENTATION PRIORITY

DO NOT try to build every feature at once.

Build in this order:

PHASE 1:
Project + New Design Input

PHASE 2:
Material Master

PHASE 3:
Engineering Rule Engine

PHASE 4:
Engineering Model

PHASE 5:
BOM Generator

PHASE 6:
Motor Feeder Schematic Template

PHASE 7:
Automatic Motor Feeder Schematic

PHASE 8:
Standard / Enhanced / Premium

PHASE 9:
Extension Panel

Only after the above works should retrofit drawing interpretation be added.

26. FUTURE RETROFIT MODULE

Design the architecture for a future module that accepts:

PDF

Scanned PDF

Image

DWG

DXF

The future workflow:

Existing Drawing
→ Drawing Reader
→ OCR/CAD extraction
→ Component recognition
→ Connection recognition
→ Engineering Model
→ Engineer Modification Request
→ Modification Engine
→ Modified Engineering Model
→ Retrofit BOM
→ Modified Drawing

Do NOT implement this before the New Design MVP is stable.

27. DEMONSTRATION DATA

Create sample data for a MOTOR feeder:

Feeder Type:
MOTOR

Voltage:
6.6 kV

Motor Power:
800 kW

Breaker:
VCB

Relay:
Siemens 7SJ66 / 7SJ6622

Phase CT:
100/1A

CBCT:
50/5A

Control Voltage:
110V DC

67N:
YES

Use this sample to demonstrate the complete workflow.

28. CRITICAL DEVELOPMENT RULE

Do not create a fake prototype that only visually looks complete.

The following must actually work:

Input data is stored.

Rules evaluate the input.

Materials are selected from the database.

Engineering model is generated.

BOM is calculated from the engineering model.

Schematic is generated from the engineering model.

Validation runs before export.

Project can be saved and reopened.

Build a functional MVP, not just UI mockups.

29. DEVELOPMENT APPROACH

First create the database schema and application architecture.

Then implement one complete Motor Feeder end-to-end.

Do not create multiple feeder types until Motor Feeder works correctly.

After each phase, test the complete flow before adding the next phase.

Do not overwrite working functionality when adding new features.

Keep all engineering rules configurable.

Keep material data separate from engineering rules.

Keep schematic templates separate from BOM logic.

30. FINAL MVP SUCCESS CRITERIA

The MVP is successful when an engineer can:

Create a project.

Select Motor Feeder.

Enter 6.6kV / 800kW / VCB / 7SJ66 / CT / CBCT / 110VDC / 67N.

Submit the engineering inputs.

ELEXORA evaluates engineering rules.

ELEXORA creates the engineering model.

ELEXORA automatically selects the required materials.

ELEXORA generates the BOM.

ELEXORA calculates BOM cost.

ELEXORA generates the motor feeder schematic.

ELEXORA validates the schematic.

Engineer can review and export the results.

This is the FIRST production milestone.

Do not implement retrofit drawing recognition until this workflow is stable.

IMPORTANT

Do not assume that the example engineering values above are universally correct.

They are demonstration inputs only.

All actual engineering decisions must come from configurable project rules and approved engineering data.

The system must be designed so an electrical engineer can modify the engineering rules and master data without changing application source code.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a7a8a350-f5f9-45cd-b7b4-8b95a1865aee).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
