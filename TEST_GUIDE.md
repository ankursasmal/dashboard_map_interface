# Testing Guide for Weather Map Dashboard

## Manual Testing Checklist

### 1. Timeline Slider Testing
- [ ] **Single Handle Mode**
  - Click "Single Handle" button
  - Drag the orange handle across the timeline
  - Verify time display updates in real-time
  - Check that the orange gradient fills from left to handle position

- [ ] **Dual-ended Range Mode**
  - Click "Dual-ended Range" button
  - Drag both handles to set a time range
  - Verify start and end times display correctly
  - Check that orange gradient fills between the two handles

- [ ] **Timeline Markers**
  - Verify date markers appear every 5 days
  - Check that the 30-day window is correctly displayed
  - Confirm hourly resolution is working

### 2. Polygon Drawing Testing
- [ ] **Drawing Mode**
  - Click "Draw New Polygon" button
  - Verify drawing mode indicator appears
  - Click on map to add vertices (test with 3-12 vertices)
  - Double-click to finish drawing
  - Confirm polygon appears on map

- [ ] **Polygon Configuration**
  - Verify polygon appears in sidebar after drawing
  - Test label editing (click edit icon, change name)
  - Expand polygon settings (click settings icon)
  - Test data source selection dropdown

### 3. Color Rules Testing
- [ ] **Adding Rules**
  - Click "+" button to add color rules
  - Verify new rule appears with default values
  - Test adding multiple rules

- [ ] **Rule Configuration**
  - Click color circle to change color
  - Test all operator options (<, <=, >, >=, =, !=)
  - Enter different threshold values
  - Verify drag handle appears for reordering

- [ ] **Rule Management**
  - Test deleting rules with trash icon
  - Verify example rules display appears when rules exist
  - Check that rules persist when expanding/collapsing

### 4. Data Source Selection Testing
- [ ] **Available Sources**
  - Verify all data sources appear in dropdown:
    - Temperature (°C)
    - Humidity (%)
    - Wind Speed (m/s)
    - Pressure (hPa)
  - Test selecting different data sources
  - Confirm selection persists

### 5. UI/UX Testing
- [ ] **Responsive Design**
  - Test on different screen sizes
  - Verify sidebar scrolls when content overflows
  - Check that timeline is responsive

- [ ] **Visual Feedback**
  - Hover effects on buttons and controls
  - Smooth transitions and animations
  - Loading states and disabled states
  - Color consistency throughout app

- [ ] **Error Handling**
  - Try drawing polygon with less than 3 vertices
  - Test with invalid input values
  - Verify graceful error handling

## Expected Behavior

### Timeline Slider
- Orange/yellow gradient styling matching reference design
- Smooth dragging with real-time updates
- Proper time formatting and display
- 30-day window with hourly resolution

### Polygon Drawing
- Minimum 3 vertices, maximum 12 vertices
- Visual feedback during drawing
- Automatic polygon completion on double-click
- Immediate appearance in sidebar

### Color Rules
- Visual color picker with immediate updates
- All comparison operators working correctly
- Drag-and-drop reordering (visual feedback)
- Example rules display for guidance

### Data Sources
- One data source per polygon constraint
- Proper unit display in dropdown
- Persistent selection across sessions

## Performance Testing
- [ ] **Map Performance**
  - Test with multiple polygons (5-10)
  - Verify smooth map interactions
  - Check memory usage with browser dev tools

- [ ] **Timeline Performance**
  - Test rapid slider movements
  - Verify no lag in time updates
  - Check smooth gradient animations

## Browser Compatibility
Test in the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Known Limitations
1. **Polygon Vertices**: Limited to 3-12 vertices for optimal performance
2. **Data Sources**: Currently using mock data (ready for API integration)
3. **Time Range**: Fixed 30-day window (configurable in code)
4. **Color Rules**: No validation for overlapping rules (by design)

## Troubleshooting

### Common Issues
1. **Map not loading**: Check internet connection for tile loading
2. **Polygon not appearing**: Ensure minimum 3 vertices and double-click to finish
3. **Color rules not saving**: Verify all required fields are filled
4. **Timeline not updating**: Check browser console for JavaScript errors

### Debug Steps
1. Open browser developer tools (F12)
2. Check console for error messages
3. Verify network requests are successful
4. Check local storage for persisted data

## Success Criteria
✅ All timeline modes work smoothly with orange gradient styling
✅ Polygon drawing and editing functions correctly
✅ Color rules can be added, edited, and deleted
✅ Data source selection works for all available sources
✅ UI matches the reference design provided
✅ No console errors during normal operation
✅ Responsive design works on different screen sizes
