# Generated for Team Task Manager.

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("tasks", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="task",
            name="priority",
            field=models.CharField(
                choices=[("LOW", "Low"), ("MEDIUM", "Medium"), ("HIGH", "High"), ("URGENT", "Urgent")],
                default="MEDIUM",
                max_length=20,
            ),
        ),
    ]
