Создай новый файл PRODUCT_SPEC.md.

Перед изменением скажи, что ты создашь только один файл PRODUCT_SPEC.md.
Не меняй src.
Не меняй package.json.
Не устанавливай пакеты.
Не делай commit.

Содержимое файла:

# Cafe Shift — Product Specification

## Product Summary

Cafe Shift is a LINE-first SaaS MVP for Japanese cafes and tea production shops.

The first demo client is a real cafe in Japan.

The product focuses on:

- employee shift calendar
- monthly shift availability requests
- overtime entry
- absence/sick tracking
- manager time summary
- recipe viewing and editing
- mobile-first LINE workflow

Cafe Shift does not calculate salary in the MVP.

## Target Users

### Worker

A worker uses the app mainly from LINE on a smartphone.

Main needs:

- see today’s shift
- quickly understand upcoming shifts
- see who works on selected days
- send monthly shift availability
- enter overtime
- view recipes

### Manager

A manager uses the app from both smartphone and PC.

Main needs:

- edit monthly shifts
- edit shifts by day
- edit shifts by employee
- review monthly shift requests
- see overtime entries
- mark sick/absence records
- see total working time summary
- manage employees
- manage recipes

## Core Shift Types

| Code | Japanese Label | Time | Hours |
| --- | --- | --- | --- |
| shift_1 | 1シフト | 08:30–13:00 | 4.5 |
| shift_2 | 2シフト | 13:00–17:30 | 4.5 |
| full_day | 通しシフト | 08:30–17:30 | 9 |
| off | 休み | — | 0 |
| vacation | 休暇 | — | 0 |

Break time is not handled in MVP.
Salary is not calculated in MVP.

## Worker Main Screen: /worker

The worker screen should be the most important screen in the app.

It should show all important daily information at a glance.

Sections:

1. 今日のシフト
   - today’s date
   - worker’s shift
   - short list of today’s workers

2. View mode switch
   - 自分
   - 全体

3. 2週間シフト
   - main calendar view for workers
   - show current week and next week
   - 2 rows, 7 days each
   - horizontal scroll to see the next 2 weeks
   - days should be larger than a monthly calendar
   - today must be highlighted
   - selected day must be highlighted
   - days off should use a calm gray style
   - vacation should use a soft distinct style

4. Day cards should show compact shift information:
   - ① for 1シフト
   - ② for 2シフト
   - 通 for 通しシフト
   - 休 for 休み
   - 休暇 for vacation

5. Worker icons/initials:
   - show small avatars or initials in each day card
   - expected employee count: up to 20
   - if too many workers are assigned, show first few initials and +N

Example:

① KT YS +2
② RN AK +1

6. Selected day detail
   - opens when a day is clicked
   - appears below the calendar or as a bottom sheet/popup
   - shows larger avatar/icon
   - employee name
   - shift type
   - shift time
   - notes if any

7. Quick actions
   - シフト希望を出す
   - 残業申請
   - レシピを見る

## Extended Shift Screen: /shifts

Extended shift calendar.

Features:

- 自分 / 全体 switch
- 2-week view as primary
- month view can be added later as secondary
- selected day detail card

The 2-week view is preferred because a full month becomes too small on mobile when many workers are shown.

## Monthly Shift Requests: /requests

Worker submits availability once per month.

Worker chooses dates and possible shifts they can work.

Manager later creates the final schedule while considering requests.

The worker is not creating the final schedule.

## Overtime: /overtime

Overtime entry screen.

Fields:

- date
- start time
- end time
- reason
- memo

Reasons:

- 清掃
- 接客
- 仕込み
- 在庫確認
- その他

Overtime does not require approval in MVP.

It is visible to the manager and counted in time summary.

## Vacation Wishes: /vacations

Vacation request screen.

Fields:

- start date
- end date
- comment

Used for annual vacation wishes.

## Recipes: /recipes

Recipe screen.

Layout:

1. Recipe gallery
   - photo cards
   - 2 rows
   - 3 cards visible per row if possible
   - horizontal scroll for more recipes

2. Selected recipe
   - photo
   - title
   - ingredients
   - steps
   - additional preparation notes

No tabs in MVP.
No allergy/warning system in MVP.

## Manager Screens

### /manager

Manager home screen.

Sections:

- today’s shift overview
- pending shift requests
- recent overtime entries
- quick actions

### /manager/shifts

Shift editor.

Manager can edit:

- by month
- by day
- by employee

### /manager/requests

Shift requests review.

Manager sees worker availability requests and uses them to create final schedule.

Statuses:

- pending
- reviewed
- applied
- ignored

### /manager/overtime

Overtime list.

Manager sees:

- employee
- date
- start time
- end time
- reason
- memo
- calculated overtime hours

No approval workflow in MVP.

### /manager/attendance

Time summary screen.

Shows working time for each employee in a selected calculation period.

The manager can choose the calculation start day.

Example periods:

- start day 1: May 1 – May 31
- start day 16: May 16 – June 15
- start day 21: May 21 – June 20

Columns:

- employee
- scheduled shift hours
- absence/sick deducted hours
- overtime hours
- total counted hours

Formula:

total counted hours = scheduled shift hours - absence/sick deducted hours + overtime hours

This screen does not calculate salary.

### /manager/employees

Employee management.

Fields:

- first name
- last name
- display name
- initials/avatar
- LINE user id later
- active/inactive status
- memo

Expected employee count for MVP: up to 20.

### /manager/recipes

Recipe management.

Manager can create and edit:

- recipe title
- photo
- ingredients
- steps
- preparation notes
- active/inactive status

### /manager/settings

Cafe settings.

Settings:

- calculation start day
- default language
- shift type settings later

## Calendar UX Decision

The worker calendar should prioritize a 2-week view instead of a full month view.

Reason:

- mobile screen is limited
- cafe may have 16–20 employees
- one day can contain up to 8 worker icons
- month view becomes too dense
- 2-week view allows larger day cards
- details are shown after tapping a day

The full month can be added later as a secondary overview.

## Language Strategy

Japanese is default.

English and Russian may be added later.

Do not overengineer multilingual support in MVP.

Language switch should not be in the main bottom navigation.

Possible location:

- settings
- my page
- small footer button

## LINE Strategy

Workers open Cafe Shift from LINE.

Expected Rich Menu items:

- シフト
- 希望提出
- レシピ

Manager features are shown only if the user has manager role.

## Visual Direction

Use a warm Japanese cafe style.

Preferred direction:

- deep green background
- cream cards
- warm gold accent
- soft shadows
- rounded cards
- mobile-first layout

The visual quality should be at least as good as the previous salon LINE app project, but the old booking logic must not be copied.

## MVP Risk Control

Do not build:

- payroll
- legal labor calculations
- complex approval workflows
- GPS clock-in
- complex multilingual framework
- accounting

Build first:

- useful worker calendar
- manager shift editing
- monthly requests
- overtime entry
- recipe viewer
- time summary without salary