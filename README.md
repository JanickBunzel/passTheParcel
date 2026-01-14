# Pass the Parcel: A smarter peer-to-peer parcel delivery system for Munich and beyond

## 📦 About the Project

**Pass the Parcel** is a prototype for a **peer-to-peer parcel delivery** platform designed to optimize urban logistics by enabling couriers to dynamically share delivery responsibility. Our system reduces route overlaps, lowers CO₂ emissions, and speeds up deliveries by allowing couriers to bid on and handoff parcels in real time.

This project was developed as part of the **Application Project / Bachelorseminar, Computational Social Science** at the Technical University of Munich, in collaboration with the **City of Munich**.
Supervisors: Klaus Müller (City of Munich), Prof. Dr. Jürgen Pfeffer (TUM), Janine Schröder (TUM)
Team: Ella Lavelle-Hayes, Janick Bunzel, Katharina Jäger, Paul Sander

## ❌ Problem and Background of the project

City logistics systems are facing more and more challenges due to inefficient delivery routes, traffic congestion, and environmental impact.
Munich is one of Europe’s congested cities in which multiple delivery companies such as DHL, UPS and Hermes delivery each daily a lot of packages. 
-> This results in repeated overlapping routes, increased delivery times, unnecessary CO2 emissions, longer travel distances and higher operational costs.  

To tackle this issue, **our project Pass the Parcel proposes a smarter peer-to-peer delivery system that optimizes parcel handoffs between couriers in real time and therefore optimizes routes, reduces overlaps and lowers emissions**. 

## 🌟 Key Features

- **Real-time Parcel Tracking:** Track parcels and responsible couriers in real time.
- **Dynamic Bidding System:** Couriers can bid on parcels along their route, optimizing delivery efficiency.
- **Route Optimization:** Suggests the best next courier or route for each parcel.
- **Environmental Impact Estimation:** Calculates CO₂ savings from optimized routes.
- **Digital Delivery Confirmation:** Uses photos or QR codes for proof of delivery.
- **User Ratings & Trust:** Couriers are rated based on reliability and delivery performance.

## 🚀 Getting Started: Login to our app

The app to our project can be accessed via following link: **https://pass-the-parcel-frontend.vercel.app/login**

Once opened, the user can choose between three example logins: Alice Example, Bob Example, or Carla Example
![Login to Pass the Parcel](https://raw.githubusercontent.com/JanickBunzel/passTheParcel/main/LoginPassTheParcel.png)

## ❓How to navigate the app

In the menu bar, users have the option to choose between **map, orders, my parcels and delivery**.
![Menu](https://raw.githubusercontent.com/JanickBunzel/passTheParcel/main/MenuPassTheParcel.png)

# 🗺️ Map

The map displays the **location of parcels which need to be delivered**.
![Map](https://raw.githubusercontent.com/JanickBunzel/passTheParcel/main/MapPassTheParcel.png)

# ✍️ Orders

Here users can find detailed information about the parcels which need to be delivered. They see 
- **the current location of the parcel**,
- **where** it needs **to** be **delivered**,
- the **receiver of the package**,
- the **distance** of the parcel **from their current location**,
- the **CO2** they **save** with the delivery and
- **how much** they get **paid** for delivering the package.

When the users decide to want to deliver the package they need to click on the green plus.

![Orders](https://raw.githubusercontent.com/JanickBunzel/passTheParcel/main/OrdersPassTheParcel.png)

# 🚚 Delivery

1. **Once collected**, the parcel is then displayed under the **“Active”-section**.
2. **When** the parcel is **delivered** the **user** needs to **check the green button**.
3. Then the **parcel** moves to the **“Past”-section**.

![Active](https://raw.githubusercontent.com/JanickBunzel/passTheParcel/main/DeliveryActivePassTheParcel.png)
![Past](https://raw.githubusercontent.com/JanickBunzel/passTheParcel/main/DeliveryPastPassTheParcel.png)

# 📦 My Parcels

1. Users can **create** their **own parcels** with the **green plus button**.

![Green Plus](https://raw.githubusercontent.com/JanickBunzel/passTheParcel/main/MyParcelsPassTheParcel.png)

3. Once clicked on the button users need to provide information about
   - the **start address**,
   - the **destination** of the parcel,
   - the **receiver** of the package,
   - the **weight** of the package,
   - whether their package is a **normal** one or **food** or **fragile** and
   - a **optional description** with important information for the delivery persons.

![Create Parcel](https://raw.githubusercontent.com/JanickBunzel/passTheParcel/main/CreateParcelPassTheParcel.png)
Then the users need to **click on the green button** to actually **create the parcel**. 





