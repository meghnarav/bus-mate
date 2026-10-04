export interface Student {
  id: string;
  full_name: string;
  registration_number: string;
}

const names = [
  "Rahul Sharma", "Priya Patel", "Arjun Reddy", "Neha Gupta", "Vikram Singh",
  "Ananya Desai", "Rohit Kumar", "Sneha Iyer", "Karthik Nair", "Meghna Rao",
  "Aditya Verma", "Pooja Menon", "Siddharth Joshi", "Kriti Sanon", "Varun Dhawan",
  "Ayesha Khan", "Rishi Kapoor", "Simran Kaur", "Dev Anand", "Tanya Sharma",
  "Manish Malhotra", "Kavya Madhavan", "Nikhil D'Souza", "Riya Sen", "Pranav Mistry",
  "Swati Reddy", "Abhishek Bachchan", "Shruti Haasan", "Vivek Oberoi", "Nandini Raj",
  "Tarun Tahiliani", "Radhika Apte", "Karan Johar", "Alia Bhatt", "Gaurav Chopra",
  "Deepika Padukone", "Ranbir Kapoor", "Kareena Kapoor", "Saif Ali Khan", "Katrina Kaif",
  "Hrithik Roshan", "Priyanka Chopra", "Shah Rukh Khan", "Aishwarya Rai", "Salman Khan",
  "Anushka Sharma", "Virat Kohli", "Sushant Singh", "Disha Patani", "Tiger Shroff"
];

const branches = ["BCE", "BAI", "BRS", "BEC", "BLC", "BFT"];
const years = ["21", "22", "23", "24"];

export const mockStudents: Student[] = names.map((name, index) => {
  const year = years[index % years.length];
  const branch = branches[index % branches.length];
  const roll = String(1000 + index).padStart(4, '0');
  
  return {
    id: `student_${index}`,
    full_name: name,
    registration_number: `${year}${branch}${roll}`
  };
});
