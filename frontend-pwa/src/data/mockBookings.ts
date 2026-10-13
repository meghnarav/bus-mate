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
  { id: 'TKT-1X9A', name: 'Rahul Sharma', route: 'VIT - Tambaram', bus: 'AC', date: '2023-10-25 13:30', noOfSeats: 1, seats: ['12'], subMembers: [] },
  { id: 'TKT-2B4C', name: 'Priya Patel', route: 'VIT - Velachery', bus: 'NON-AC', date: '2023-10-25 13:35', noOfSeats: 3, seats: ['15', '16', '17'], subMembers: ['Riya Patel', 'Neha Singh'] },
  { id: 'TKT-9M2Z', name: 'Arjun Reddy', route: 'VIT - Alandur', bus: 'AC', date: '2023-10-25 13:40', noOfSeats: 1, seats: ['4'], subMembers: [] },
  { id: 'TKT-7K1L', name: 'Ananya Desai', route: 'VIT - Tambaram', bus: 'AC', date: '2023-10-25 13:35', noOfSeats: 4, seats: ['21', '22', '23', '24'], subMembers: ['Aditi Rao', 'Sneha M', 'Karan J'] },
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
