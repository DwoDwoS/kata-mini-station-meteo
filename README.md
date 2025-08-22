# KATA 2 : Meteo Station

A small application for checking temperatures from cities with some graphic.

I use to do it as an acknowledge's exercice because I'm still learning code with Ada Tech School.


## API Reference

#### Get cities

```http
  GET /nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&addressdetails=1&limit=1
```

#### Get humidity and precipitation

```http
  GET /api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m,precipitation&timezone=auto
```

#### Get past days informations

```http
  GET /api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation&past_days=3&timezone=auto

