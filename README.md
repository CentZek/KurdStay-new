# KurdStay Property Atlas

Mobile-ready web application with a Capacitor 8 Android project. Run `npm ci`, `npm run build`, and `npm run dev` for the web app; `npm run android:sync` and `npm run android:open` for Android. See [ANDROID.md](ANDROID.md) for setup, debug APK builds and integration into the existing KurdStay application.

Static, responsive property marketplace prototype for the Kurdistan Region.

## Current application

- Homepage with real landmark photos, regional search and property previews.
- Interactive OpenStreetMap/Leaflet maps for Duhok, Erbil, Sulaymaniyah and Halabja, street zoom through level 19, independent regional inventory, map/list/split views, and source-pin groups.
- 4,163 real sourced advertisements with total USD asking prices: Duhok 36, Erbil 3,483, Sulaymaniyah 642, Halabja 2. Halabja remains limited to eligible real ads.
- Four source-linked video embeds confirmed by YouTube metadata (Erbil 1, Sulaymaniyah 3), loaded only after Play. Three further source links could not confirm embedding and are external-link-only. No Halabja video was found.
- Every ad has a real source photo; no example listing images. Existing downloaded galleries are retained; new source images load lazily from the advertiser CDN. See REGION-SOURCES.md for provenance and limitations.
- Results paginate at 12 cards on phones and 24 on wider screens; map groups at 40 entries. All matching source pins remain on the map. Region, type, advertised area, price, bedrooms, video and viewport filters. Favorites remain local and are viewed per region.
- Listing creator with a region field, photos, MP4/WebM upload or YouTube/Vimeo link, preview and IndexedDB media drafts. Drafts stay on the device; there are no shared seller accounts or cloud publication.

See [REGION-SOURCES.md](REGION-SOURCES.md) and the source fields in dist/listings.json for provenance and coverage limitations. LISTING-SOURCES.md records the earlier Duhok import.

## Location accuracy

Maps are OpenStreetMap, not Google Maps. KRSO is an administrative reference, not a cadastral or street-tile provider. District navigation in Duhok uses approximate town centers; other area choices use source advertisement names and coordinates. Neither is a boundary layer. Source pins are explicitly unverified, may be shared by unrelated ads and must not be used as surveyed property locations. Verified latitude/longitude and parcel geometry remain null.

Official parcel maps can be integrated after verifying their coordinate reference system and georeferencing. Scanned maps require registration and digitization; empty map space does not identify plots for sale. Owner-placed pins, parcel ownership and apartment units require independent confirmation.

## Local use and checks

Serve dist with a static HTTP server, for example: python -m http.server 4173 --directory dist.

Run `npm ci`, `npm run build` and `npm test`. The regional check uses a Leaflet stub to verify map centers, marker groups, route switching and filter isolation. Mobile checks cover navigation, back-button behaviour, modal dismissal and paging. These are DOM interaction tests, not visual browser tests.

Browser visual QA remains unverified: Windows Computer Use repeatedly stopped because it could not establish the browser URL. Source, media, DOM interaction, map state and publishing checks are used instead. The same preview infrastructure was not retried without evidence of recovery.

## Assets and deployment

The visual theme follows KurdStay (https://www.kurdstay.com), inspected on 1 November 2026: navy #102b3d / #0b2131, gold #d7b46a, ivory #f8f7f3, Inter body text and Playfair Display headings. dist/kurdstay.css applies the shared theme to the header, split homepage hero, destination cards, search, results, maps and dialogs. The application is branded KurdStay, using the exact mountain mark, two-tone wordmark and tagline from the main KurdStay header. The oversized illustrated map promotion is replaced with a compact banner matching KurdStay’s host-banner design. Browser storage keys retain their original names to preserve existing favorites and drafts. Main text/button color pairs pass 4.5:1 contrast checks; browser visual QA remains unavailable as described above.

Region photographs: Wikimedia Commons. Credits and CC licenses are displayed below the homepage cards and in dist/assets/region-photo-credits.json. Hero/example photos: Unsplash, illustrative rather than a particular listing. Leaflet: BSD-2-Clause, local license file. Map data: OpenStreetMap contributors, attribution displayed. Fonts: Inter and Playfair Display via Google Fonts.

For Android setup and integration with the existing KurdStay app, see ANDROID.md. Configure a tile provider appropriate for public-scale traffic before a wider launch.
