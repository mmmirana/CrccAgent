class EmailOptions {
    constructor(fromEmail, toEmails, subject, text, html) {
        this.fromEmail = fromEmail;
        this.toEmails = toEmails;
        this.subject = subject;
        this.text = text;
        this.html = html;
    }
}

module.exports = EmailOptions;