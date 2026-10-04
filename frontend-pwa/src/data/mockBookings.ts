export interface Booking {
  id: string;
  name: string;
  route: string;
  bus: string;
  date: string;
  noOfSeats: number;
  seats: string[];
  subMembers: string[];
}

const DEFAULT_BOOKINGS: Booking[] = [
  { id: 'TKT-1X9A', name: 'Rahul Sharma', route: 'Tambaram - VIT', bus: 'AC', date: '2023-10-25 14:30', noOfSeats: 1, seats: ['12'], subMembers: [] },
  { id: 'TKT-2B4C', name: 'Priya Patel', route: 'Velachery - VIT', bus: 'NON-AC', date: '2023-10-25 15:00', noOfSeats: 3, seats: ['15', '16', '17'], subMembers: ['Riya Patel', 'Neha Singh'] },
  { id: 'TKT-9M2Z', name: 'Arjun Reddy', route: 'Alandur - VIT', bus: 'AC', date: '2023-10-25 16:15', noOfSeats: 1, seats: ['4'], subMembers: [] },
  { id: 'TKT-7K1L', name: 'Ananya Desai', route: 'Tambaram - VIT', bus: 'AC', date: '2023-10-25 14:35', noOfSeats: 4, seats: ['21', '22', '23', '24'], subMembers: ['Aditi Rao', 'Sneha M', 'Karan J'] },
];

export const getBookings = (): Booking[] => {
  const saved = localStorage.getItem('busmate_live_bookings');
  if (saved) {
    return JSON.parse(saved);
  }
  localStorage.setItem('busmate_live_bookings', JSON.stringify(DEFAULT_BOOKINGS));
  return DEFAULT_BOOKINGS;
};

export const saveBookings = (bookings: Booking[]) => {
  localStorage.setItem('busmate_live_bookings', JSON.stringify(bookings));
};
