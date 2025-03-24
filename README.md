# RoomSpace - Expo Roomate Coordination App


## Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Video](#-video)
  [Installation](#-installation)

## Overview
RoomSpace is a modern mobile application built with React Native and Expo that allows roomates to better coordinate and organize their day to day lives.

## Features

### Core Functionality
- **Roomate Status** - Know who is home and away, without revealing their privacy or location.
- **Custom Rooms** - Create rooms and configure features and configurations.
- **Real-time Updates** - Update status in real time using background geo-fencing.
- **User Profiles** - Personalized accounts with booking history
- **Security** - Account security and authorization using Firebase ensuring that eveything is safe.

##  Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React Native | Core framework |
| Expo | Development platform |
| TypeScript | Type checking |
| React Navigation | Routing and navigation |
| NativeWind | Tailwind CSS for React Native |

### Backend Services
| Service | Function |
|---------|----------|
| Firebase | Authentication |
| Firestore | Database |
| Cloud Functions | Serverless backend |

### Additional Libraries
| Library | Purpose |
|---------|---------|
| react-native-maps | Interactive maps |
| react-native-calendars | Booking calendar |
| Formik + Yup | Forms validation |

## Video
| | | |
|:-------------------------:|:-------------------------:|:-------------------------:|
| [Video Demo] (https://www.youtube.com/shorts/C926Ntfln3E)

### Prerequisites
- Node.js v16 or higher
- Yarn package manager
- Expo CLI (`npm install -g expo-cli`)
- iOS/Android simulator or physical device

## 🛠️ Installation

### Prerequisites
Before you begin, ensure you have met the following requirements:
- [Node.js](https://nodejs.org/) (v16.x or higher)
- [Yarn](https://yarnpkg.com/) (recommended) or npm
- [Expo CLI](https://docs.expo.dev/get-started/installation/) installed globally
- For iOS development:
  - Xcode (for simulator)
  - [CocoaPods](https://cocoapods.org/) (for native modules)
- For Android development:
  - Android Studio
  - Configured Android Virtual Device (AVD)

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/roomspace.git
cd roomspace
```
### Step 2: Install Dependencies
```bash
yarn install
# or if using npm
npm install
```
