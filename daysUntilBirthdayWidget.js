// Enter birthdays here using yyyy.MM.dd (year.month.day).
// Uncomment the examples and replace them with your own entries.
const birthdays = [
    { "name": "Me", "date": "2026.09.14" },
    { "name": "Messi", "date": "1987.06.24" },
    { "name": "Ronaldo", "date": "1976.09.18" },
    { "name": "Haaland", "date": "2000.07.21" },
    { "name": "Mom", "date": "1972.12.11" },
    { "name": "Dad", "date": "1970.04.29" },
    { "name": "MacDonald", "date": "2000.01.07" },
    { "name": "Neymar", "date": "1992.02.05" },
    { "name": "Mbappe", "date": "1998.12.20" },
    { "name": "Son", "date": "1992.07.08" },
    { "name": "Jude", "date": "2003.06.29" },
    { "name": "Foden", "date": "2000.05.28" },
    { "name": "Jordan", "date": "1963.02.17" },
    { "name": "LeBron", "date": "1984.12.30" },
    { "name": "Curry", "date": "1988.03.14" },
    { "name": "Bolt", "date": "1986.08.21" },
    { "name": "Nadal", "date": "1986.06.03" },
    { "name": "Federer", "date": "1981.08.08" },
    { "name": "Djokovic", "date": "1987.05.22" },
    { "name": "Serena", "date": "1981.09.26" },
];

//////////////////////////////////
// edit these according to your language
const daysTillBdayHeader = 'Days Till Bday';
const daysText = 'Days';
const todayText = 'Today!';
//////////////////////////////////

const timeFormatter = new DateFormatter();
timeFormatter.dateFormat = 'yyyy.MM.dd HH:mm:ss';

// used for inserting space characters
const lineLength = config.widgetFamily === "small" ? 5 : 10;

// setting font style and color
const headerFont = new Font('Menlo-regular', 14);
const birthdayNameFont = new Font('Menlo-regular', 14);
const smallInfoFont = new Font('Menlo-regular', 10);
const smallInfoHilightedFont = new Font('Menlo-Bold', 10);
const updatedAtFont = new Font('Menlo-regular', 7);
const fontColorGrey = new Color("#918A8A");
// Automatically follows the system appearance: light first, dark second.
const primaryTextColor = Color.dynamic(new Color("#000000"), new Color("#FFFFFF"));
const backgroundColor = Color.dynamic(new Color("#FFFFFF"), new Color("#000000"));
const fontHilightedColor = new Color("#15803D")

const widget = await createWidget();
widget.backgroundColor = backgroundColor;
if (!config.runsInWidget) {
    await widget.presentLarge();
}

Script.setWidget(widget);
Script.complete();

async function createWidget() {
    const widget = new ListWidget();
    let headerRow = widget.addStack();
    let headerText = headerRow.addText(daysTillBdayHeader);
    headerText.textColor = fontColorGrey;
    headerText.font = headerFont;

    widget.addSpacer(4);

    const upcomingBirthdays = getUpcomingBirthdays(birthdays);
    if (upcomingBirthdays.length === 0) {
        const emptyText = widget.addText('Add names and birthdays at the top of the script.');
        emptyText.textColor = primaryTextColor;
        emptyText.font = smallInfoFont;
    }

    const columns = config.widgetFamily === "small" ? 1 : 2;
    const maxVisibleItems = config.widgetFamily === "small" ? 4 :
                            config.widgetFamily === "medium" ? 8 : 16;
    // Each row contains the configured number of birthday entries.
    let currentRow;
    // Count displayed birthdays up to maxVisibleItems.
    let birthdayCounter = 0;
    for (let birthday of upcomingBirthdays) {
        if (birthdayCounter === maxVisibleItems) {
            // only the top `maxVisibleItems` earliest birthdays are shown in the widget
            break;
        }
        if (birthdayCounter % columns === 0) {
            // start a new row
            currentRow = widget.addStack();
        }
        addBirthdayInfoToRow(birthday, currentRow);
        birthdayCounter++;
        if (birthdayCounter < maxVisibleItems) {
            widget.addSpacer(1);
        }
    }

    /*
    let updatedAt = widget.addText('Update: ' + timeFormatter.string(new Date()));
    updatedAt.font = updatedAtFont;
    updatedAt.textColor = primaryTextColor;
    updatedAt.centerAlignText();
    */
    return widget;
}

// used to align the information
function addSpaces(amount, row) {
    for (let i = 0; i < amount; i++) {
        let text = row.addText(' ');
        text.font = birthdayNameFont;
    }
}

function addBirthdayInfoToRow(birthday, row) {
    addSpaces(lineLength - birthday.name.length, row);
    let nameRow = row.addText(birthday.name);
    nameRow.font = birthdayNameFont;
    nameRow.textColor = primaryTextColor;

    let isToday = birthday.daysUntil === 0

    let daysUntilText = isToday ? todayText : birthday.daysUntil + ' ' + daysText
    let formattedDate = formatDate(birthday.date)
    let actualText = ' ' + daysUntilText + '\n ' + formattedDate;
    let daysInfoText = row.addText(actualText);
    daysInfoText.textColor = isToday ? fontHilightedColor : fontColorGrey;
    daysInfoText.font = isToday ? smallInfoHilightedFont : smallInfoFont;
}

function formatDate(dateString) {
    const [year, month, date] = dateString.split('.').map(Number);

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr",
        "May", "Jun", "Jul", "Aug",
        "Sep", "Oct", "Nov", "Dec"
    ];

    return `${monthNames[month - 1]} ${String(date)}`;
}

function parseBirthday(value) {
    const match = typeof value === 'string' && /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(value);
    if (!match) {
        throw new Error('Birthday must use yyyy.MM.dd: ' + value);
    }
    const [, year, month, day] = match.map(Number);
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(0, 0, 0, 0);
    if (year < 1 || date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        throw new Error('Invalid birthday: ' + value);
    }
    return date;
}

function calculateDaysUntil(birthday, now = new Date()) {
    // Compare local calendar dates using UTC arithmetic to avoid DST offsets.
    const year = now.getFullYear();
    const today = Date.UTC(year, now.getMonth(), now.getDate());
    let target = Date.UTC(year, birthday.getUTCMonth(), birthday.getUTCDate());
    if (target < today) {
        target = Date.UTC(year + 1, birthday.getUTCMonth(), birthday.getUTCDate());
    }
    // February 29 birthdays fall on March 1 in non-leap years.
    return (target - today) / 86400000;
}

function getUpcomingBirthdays(entries, now = new Date()) {
    if (!Array.isArray(entries)) {
        throw new Error('birthdays must be an array of {name, date} objects.');
    }
    return entries.map((entry, index) => {
        if (!entry || typeof entry.name !== 'string' || !entry.name.trim()) {
            throw new Error('Birthday entry ' + (index + 1) + ' needs a name.');
        }
        return {
            name: entry.name,
            date: entry.date,
            daysUntil: calculateDaysUntil(parseBirthday(entry.date), now)
        };
    }).sort((a, b) => a.daysUntil - b.daysUntil);
}
