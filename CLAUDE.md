# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite application that displays factories in Prachinburi province, Thailand on an interactive map. The application helps users find nearby factories with filtering capabilities.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript compiler first, then Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Architecture

### Core Components
- **App.tsx**: Main application component managing state for factories data, user location, selected factory, and filters
- **Sidebar.tsx**: Left panel with search, filters, and factory list
- **MapWrapper.tsx**: Map component using Leaflet/React-Leaflet with clustering
- **FactoryCard.tsx**: Individual factory display component

### Data Structure
- Factory data is loaded from `/public/data/factories.geojson` (GeoJSON format)
- Thai language properties for factory information (ชื่อโรงงาน, ผู้ประกอบก, etc.)
- Factory types defined in `src/types/factory.ts` with TypeScript interfaces

### Key Technologies
- **React 19** with TypeScript
- **Chakra UI** for UI components
- **Leaflet + React-Leaflet** for mapping
- **React-Leaflet-Cluster** for marker clustering
- **Turf.js** for geospatial calculations
- **Vite** for build tooling

### State Management
- Uses React useState hooks for local state
- Main state: factories data, user location, selected factory, filters
- Filters include: search term, factory types, districts, radius toggle

### Geolocation
- Attempts to get user's current location
- Falls back to Prachinburi coordinates (14.0504, 101.3678) if geolocation fails

### Map Performance
- Displays all 632+ factory markers without clustering
- Optimized marker icons (8px normal, 12px selected) for better performance
- Pre-created icon instances to reduce render overhead
- Uses React.memo for MapWrapper component optimization

### Color Scheme
- Navy (#142E4C): Primary text and factory markers
- Beige (#F7EFE2): Background
- Orange (#E49141): Accent and selected markers
- Gray (#9B9488): Muted text
- Sky (#98B6D4): User location and hover states
- Steel (#4A6F8F): Borders and outlines

### Styling
- Uses Chakra UI theme system
- Custom colors defined in `src/theme/index.ts`
- Thai font family: 'Noto Sans Thai'
- Main logo integrated in sidebar and favicon

## Important Notes

- This is a Thai-language application with Thai text content
- Factory data contains sensitive business information (addresses, phone numbers, etc.)
- The application targets a specific geographic region (Prachinburi province)
- Uses OpenStreetMap and other tile providers for map display
- Factory coordinates use GeoJSON format: geometry.coordinates[0] = lng, geometry.coordinates[1] = lat