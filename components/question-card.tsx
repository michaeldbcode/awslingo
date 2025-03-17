"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { submitQuizResult } from "@/utils/api"

type Question = {
  id: number
  question: string
  answers: string[]
  correctAnswers: number[]
}


const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "A reporting application runs on Amazon EC2 instances behind an Application Load Balancer. The instances run in an Amazon EC2 Auto Scaling group across multiple Availability Zones. For complex reports, the application can take up to 15 minutes to respond to a request. A solutions architect is concerned that users will receive HTTP 5xx errors if a report request is in process during a scale-in event. \n What should the solutions architect do to ensure that user requests will be completed before instances are terminated?",
    answers: [
      "Enable sticky sessions (session affinity) for the target group of the instances.",
      "Increase the instance size in the Application Load Balancer target group.",
      "Increase the cooldown period for the Auto Scaling group to a greater amount of time than the time required for the longest running responses.",
      "Increase the deregistration delay timeout for the target group of the instances to greater than 900 seconds."
    ],
    correctAnswers: [3] // Indices
  },
  {
    id: 2,
    question: "A company has an on-premises application that exports log files about users of a website. The log files range from 20 GB to 30 GB in size. A solutions architect has created an Amazon S3 bucket to store the files. The files will be uploaded directly from the application. The network connection experiences intermittent failures, and the upload sometimes fails. The solutions architect must design a solution that resolves this issue. The solution must minimize operational overhead. \n Which solution will meet these requirements?",
    answers: [
      "Enable S3 Transfer Acceleration.",
      "Copy the files to an Amazon EC2 instance in the closest AWS Region. Use S3 Lifecycle policies to copy the log files to Amazon S3.",
      "Use multipart upload to Amazon S3.",
      "Upload the files to two AWS Regions simultaneously. Enable two-way Cross-Region Replication between the two Regions."
    ],
    correctAnswers: [2] // Index 
  },

  {
    id: 3,
    question: "Which components are required to build a site-to-site VPN connection to AWS? (Select TWO.)",
    answers: [
      "An internet gateway",
      "A NAT gateway",
      "A customer gateway",
      "Amazon API Gateway",
      "A virtual private gateway"
    ],
    correctAnswers: [2, 4] // Indices
  },
  {
    id: 4,
    question: "A company is transitioning its Amazon EC2 based MariaDB database to Amazon RDS. The company has already identified a database instance type that will meet the company's CPU and memory requirements. The database must provide at least 40 GiB of storage capacity and 1,000 IOPS. \n Which storage configuration for the Amazon RDS for MariaDB instance is MOST cost-effective?",
    answers: [
      "Provision 350 GiB of magnetic storage for the RDS instance.",
      "Provision 50 GiB of General Purpose SSD (gp3) storage for the RDS instance.",
      "Provision 334 GiB of General Purpose SSD (gp2) storage for the RDS instance.",
      "Provision 50 GiB of Provisioned IOPS storage with 1,000 IOPS for the RDS instance."
    ],
    correctAnswers: [1] // Index 
  },
  {
    id: 5,
    question: "A company needs to look up configuration details about how a Linux-based Amazon EC2 instance was launched. \n Which command should a solutions architect run on the EC2 instance to gather the system metadata?",
    answers: [
      "curl http://169.254.169.254/latest/meta-data/",
      "curl http://localhost/latest/meta-data/",
      "curl http://254.169.254.169/latest/meta-data/",
      "curl http://192.168.0.1/latest/meta-data/"
    ],
    correctAnswers: [0] // Indices
  },
  {
    id: 6,
    question: "A company is deploying a new database on a new Amazon EC2 instance. The workload of this database requires a single Amazon Elastic Block Store (Amazon EBS) volume that can support up to 20,000 IOPS. \n Which type of EBS volume meets this requirement?",
    answers: [
      "Throughput Optimized HDD",
      "Provisioned IOPS SSD",
      "General Purpose SSD",
      "Cold HDD"
    ],
    correctAnswers: [1] // Index 
  },
  {
    id: 7,
    question: "A company uses one AWS account to run production workloads. The company has a separate AWS account for its security team. During periodic audits, the security team needs to view specific account settings and resource configurations in the AWS account that runs production workloads. A solutions architect must provide the required access to the security team by designing a solution that follows AWS security best practices. \n Which solution will meet these requirements?",
    answers: [
      "Create an IAM user for each security team member in the production account. Attach a permissions policy that provides the permissions required by the security team to each user.",
      "Create an IAM role in the production account. Attach a permissions policy that provides the permissions required by the security team. Add the security team account to the trust policy.",
      "Create a new IAM user in the production account. Assign administrative privileges to the user. Allow the security team to use this account to log in to the systems that need to be accessed.",
      "Create an IAM user for each security team member in the production account. Attach a permissions policy that provides the permissions required by the security team to a new lAM group. Assign the security team members to the group."
    ],
    correctAnswers: [1] // Indices
  },
  {
    id: 8,
    question: "A company asks a solutions architect to implement a pilot light disaster recovery (DR) strategy for an existing on-premises application. The application is self contained and does not need to access any databases. \n Which solution will implement a pilot light DR strategy?",
    answers: [
      "Back up the on-premises application, configuration, and data to an Amazon S3 bucket. When the on-premises application fails, build a new hosting environment on AWS and restore the application from the information that is stored in the S3 bucket.",
      "Recreate the application hosting environment on AWS by using Amazon EC2 instances and stop the EC2 instances. When the on-premises application fails, start the stopped EC2 instances and direct 100% of application traffic to the EC2 instances that are running in the AWS Cloud.",
      "Recreate the application hosting environment on AWS by using Amazon EC2 instances. Direct 10% of application traffic to the EC2 instances that are running in the AWS Cloud. When the on-premises application fails, direct 100% of application traffic to the EC2 instances that are running in the AWS Cloud.",
      "Back up the on-premises application, configuration, and data to an Amazon S3 bucket. When the on-premises application fails, rebuild the on-premises hosting environment and restore the application from the information that is stored in the S3 bucket."
    ],
    correctAnswers: [1] // Index 
  },
  {
    id: 9,
    question: "A company runs its website on Amazon EC2 instances behind an Application Load Balancer that is configured as the origin for an Amazon CloudFront distribution. The company wants to protect against cross-site scripting and SQL injection attacks. \n Which approach should a solutions architect recommend to meet these requirements?",
    answers: [
      "Enable AWS Shield Advanced. List the CloudFront distribution as a protected resource.",
      "Define an AWS Shield Advanced policy in AWS Firewall Manager to block cross-site scripting and SQL injection attacks.",
      "Deploy AWS Firewall Manager on the EC2 instances. Create conditions and rules that block cross-site scripting and SQL injection attacks.",
      "Set up AWS WAF on the CloudFront distribution. Use conditions and rules that block cross-site scripting and SQL injection attacks."
    ],
    correctAnswers: [3] // Indices
  },
  {
    id: 10,
    question: "A company needs to maintain data records for a minimum of 5 years. The data is rarely accessed after it is stored. The data must be accessible within 2 hours. \n Which solution will meet these requirements MOST cost-effectively?",
    answers: [
      "Store the data in an Amazon Elastic File System (Amazon EFS) file system. Access the data by using AWS Direct Connect.",
      "Store the data in an Amazon Elastic Block Store (Amazon EBS) volume. Create snapshots. Store the snapshots in an Amazon S3 bucket.",
      "Store the data in an Amazon S3 bucket. Use an S3 Lifecycle policy to move the data to S3 Standard-Infrequent Access (S3 Standard-IA).",
      "Store the data in an Amazon S3 bucket. Use an S3 Lifecycle policy to move the data to S3 Glacier Instant Retrieval."
    ],
    correctAnswers: [3] // Index 
  },
  {
    id: 11,
    question: "An application runs on two Amazon EC2 instances behind a Network Load Balancer. The EC2 instances are in a single Availability Zone. \n What should a solutions architect do to make this architecture more highly available?",
    answers: [
      "Create a new VPC with two new EC2 instances in the same Availability Zone as the original EC2 instances. Create a VPC peering connection between the two VPCs",
      "Replace the Network Load Balancer with an Application Load Balancer that is configured with the EC2 instances in an Auto Scaling group.",
      "Configure Amazon Route 53 to perform health checks on the EC2 instances behind the Network Load Balancer. Add a failover routing policy.",
      "Place the EC2 instances in an Auto Scaling group that extends across multiple Availability Zones. Designate the Auto Scaling group as the target of the Network Load Balancer."
    ],
    correctAnswers: [3] // Indices
  },
  {
    id: 12,
    question: "A company that processes satellite images has an application that runs on AWS. The company stores the images in an Amazon S3 bucket. For compliance reasons, the company must replicate all data once a month to an on-premises location. The average amount of data that the company needs to transfer is 60 TB. \n What is the MOST cost-effective way to transfer this data?",
    answers: [
      "Export the data monthly from the existing S3 bucket to an AWS Snowball Edge Storage Optimized device. Ship the device to the on-premises location. Transfer the data. Return the device a week later.",
      "Use S3 bucket replication to copy all objects to a new S3 bucket that uses S3 Standard-Infrequent Access (S3 Standard-IA) storage. Use an AWS Storage Gateway File Gateway to transfer the data from the new S3 bucket to the on-premises location. Delete the images from the new S3 bucket after the transfer of the data.",
      "Use S3 bucket replication to copy all objects to a new S3 bucket that uses S3 Standard-Infrequent Access (S3 Standard-IA) storage. Use Amazon S3 to transfer the data from the new S3 bucket to the on-premises location. Delete the images from the new S3 bucket after the transfer of the data.",
      "Create an Amazon CloudFront distribution for the objects in the existing S3 bucket. Download the objects from CloudFront to the on-premises location every month."
    ],
    correctAnswers: [0] // Index 
  },
  {
    id: 13,
    question: "A company has an application that runs on a large general purpose Amazon EC2 instance type that is part of an EC2 Auto Scaling group. The company wants to reduce future costs associated with this application. After the company reviews metrics and logs in Amazon CloudWatch, the company notices that this application runs randomly a couple of times a day to retrieve and manage data. According to CloudWatch, the maximum runtime for each request is 10 minutes, the memory use is 4 GB, and the instances are always in the running state. \n Which solution will reduce costs the MOST?",
    answers: [
      "Deploy the application on a large burstable EC2 instance.",
      "Refactor the application code to run as an AWS Lambda function.",
      "Containerize the application by using Amazon Elastic Kubernetes Service (Amazon EKS). Host the container on EC2 instances.",
      "Use AWS Instance Scheduler to start and stop the instances based on the runtimes in the logs."
    ],
    correctAnswers: [1] // Indices
  },
  {
    id: 14,
    question: "A media company is designing a new application for graphic rendering. The application requires up to 400 GB of storage for temporary data that is discarded after the frames are rendered. The application requires approximately 40,000 random IOPS to perform the rendering. \n What is the MOST cost-effective storage option for this rendering application?",
    answers: [
      "A storage optimized Amazon EC2 instance with instance store storage",
      "A storage optimized Amazon EC2 instance with a Provisioned IOPS SSD (io1 or io2) Amazon Elastic Block Store (Amazon EBS) volume",
      "A burstable Amazon EC2 instance with a Throughput Optimized HDD (st1) Amazon Elastic Block Store (Amazon EBS) volume",
      "A burstable Amazon EC2 instance with Amazon S3 storage over a VPC endpoint"
    ],
    correctAnswers: [0] // Index 
  },
  {
    id: 15,
    question: "A company is developing a new mobile version of its popular web application in the AWS Cloud. The mobile app must be accessible to internal and external users. The mobile app must handle authorization, authentication, and user management from one central source. \n Which solution meets these requirements?",
    answers: [
      "IAM roles",
      "IAM users and groups",
      "Amazon Cognito user pools",
      "AWS Security Token Service (AWS STS)"
    ],
    correctAnswers: [2] // Indices
  },
  {
    id: 16,
    question: "A company is investigating services to manage vulnerability scans in Amazon EC2 instances and container images that the company stores in Amazon Elastic Container Registry (Amazon ECR). The service should identify potential software vulnerabilities and categorize the severity of the vulnerabilities. \n Which AWS service will meet these requirements?",
    answers: [
      "Amazon GuardDuty",
      "Patch Manager, a capability of AWS Systems Manager",
      "Amazon Inspector",
      "AWS Config"
    ],
    correctAnswers: [2] // Index 
  },
  {
    id: 17,
    question: "A company is developing a chat application that will be deployed on AWS. The application stores the messages by using a key-value data model. Groups of users typically read the messages multiple times. A solutions architect must select a database solution that will scale for a high rate of reads and will deliver messages with microsecond latency. \n Which database solution will meet these requirements?",
    answers: [
      "Amazon Aurora with Aurora Replicas",
      "Amazon DynamoDB with DynamoDB Accelerator (DAX)",
      "Amazon Aurora with Amazon ElastiCache for Memcached",
      "Amazon Neptune with Amazon ElastiCache for Memcached"
    ],
    correctAnswers: [1] // Indices
  },
  {
    id: 18,
    question: "A company is deploying a new application that will consist of an application layer and an online transaction processing (OLTP) relational database. The application must be available at all times. However, the application will have unpredictable traffic patterns. The company wants to pay the minimum for compute costs during these idle periods. \n Which solution will meet these requirements MOST cost effectively?",
    answers: [
      "Run the application on Amazon EC2 instances by using a burstable instance type. Use Amazon Redshift for the database.",
      "Deploy the application and a MySQL database to Amazon EC2 instances by using AWS CloudFormation. Delete the instances at the beginning of the idle periods.",
      "Deploy the application on Amazon EC2 instances in an Auto Scaling group behind an Application Load Balancer. Use Amazon RDS for MySQL for the database.",
      "Run the application in containers with Amazon Elastic Container Service (Amazon ECS) on AWS Fargate. Use Amazon Aurora Serverless for the database."
    ],
    correctAnswers: [3] // Index 
  },
  {
    id: 19,
    question: "A company has strict data protection requirements. A solutions architect must configure security for a VPC to ensure that backend Amazon RDS DB instances cannot be accessed from the internet. The solutions architect must ensure that the DB instances are accessible from the application tier over a specified port only. \n Which actions should the solutions architect take to meet these requirements? (Select TWO.)",
    answers: [
      "Specify a DB subnet group that contains only private subnets for the DB instances.",
      "Attach an elastic network interface with a private IPv4 address to each DB instance.",
      "Configure AWS Shield with the VPC. Update the route tables for the subnets that the DB instances use.",
      "Configure an AWS Direct Connect connection on the database port between the application tier and the backend.",
      "Add an inbound rule to the database security group that allows requests from the security group of the application tier over the database port. Remove other inbound rules."
    ],
    correctAnswers: [0, 4] // Indices
  },
  {
    id: 20,
    question: "A company is designing a disaster recovery (DR) architecture for an important application on AWS. The company has determined that the recovery time objective (RTO) is 5 minutes with a minimal running instance capacity to support the application in the AWS DR site. The company needs to minimize costs for the DR architecture. \n Which DR strategy will meet these requirements?",
    answers: [
      "Warm standby",
      "Pilot light",
      "Multi-site active-active",
      "Backup and restore"
    ],
    correctAnswers: [0] // Index 
  },
];

export function QuestionCard({ username }: { username: string }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [startTime] = useState<number>(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Set quiz in progress when component mounts
    localStorage.setItem("quizInProgress", "true")
    // Trigger storage event for navbar to detect
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'quizInProgress',
      newValue: 'true'
    }))
  
    // Clean up when component unmounts
    return () => {
      localStorage.removeItem("quizInProgress")
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'quizInProgress',
        newValue: null
      }))
    }
  }, [])

  useEffect(() => {
    if (!isComplete) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [startTime, isComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex]

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswers((prev) => {
      // Check if this is a single-answer question
      const isSingleAnswer = currentQuestion.correctAnswers.length === 1;
      
      if (isSingleAnswer) {
        // For single-answer questions, only allow one selection
        return [index];
      } else {
        // For multiple-answer questions, handle adding/removing selections
        if (prev.includes(index)) {
          return prev.filter((i) => i !== index);
        } else {
          // Only allow selecting up to the number of correct answers
          if (prev.length < currentQuestion.correctAnswers.length) {
            return [...prev, index];
          }
          return prev;
        }
      }
    });
  };

  const handleNext = async () => {
    // Check if answer was correct and update count
    const isCorrect = 
      selectedAnswers.length === currentQuestion.correctAnswers.length &&
      selectedAnswers.sort().every((ans, index) => 
        ans === currentQuestion.correctAnswers.sort()[index]
      );
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
   
    if (currentQuestionIndex === QUIZ_QUESTIONS.length - 1) {
      setIsComplete(true);
      setIsSubmitting(true);
      setError("");

      const finalCorrectCount = correctCount + (isCorrect ? 1 : 0);
      const result = {
        username,
        correctAnswers: finalCorrectCount,
        totalTime: elapsedTime
      };

      try {
        await submitQuizResult(result);
        
        // Set completion flag
        localStorage.setItem("quizCompleted", "true");
        
        // Trigger storage event for navbar to detect
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'quizCompleted',
          newValue: 'true'
        }));
      } catch (error) {
        console.error('Failed to submit quiz result:', error);
        setError("Failed to submit quiz result. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswers([]);
    }
  };

  if (isComplete) {
    return (
      <Card className="w-full bg-blue-600 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-lg">
            You got {correctCount} out of {QUIZ_QUESTIONS.length} questions correct
          </p>
          <p className="text-lg">
            Total time: {formatTime(elapsedTime)}
          </p>
          {error && (
            <p className="text-red-300">
              {error}
            </p>
          )}
          {isSubmitting && (
            <p className="text-blue-200">
              Submitting your results...
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-blue-600 text-white shadow-xl h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="text-sm text-blue-100">
            Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
          </div>
          <div className="flex items-center gap-2 text-yellow-300">
            <Clock className="h-4 w-4" />
            <span>{formatTime(elapsedTime)}</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center mt-4">
          {currentQuestion.question}
          {currentQuestion.correctAnswers.length > 1 && (
            <div className="text-sm font-normal text-blue-200 mt-2">
              Select {currentQuestion.correctAnswers.length} answers
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {currentQuestion.answers.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 flex items-center gap-4 rounded-lg transition-all duration-200
                ${selectedAnswers.includes(index) ? "bg-white/20" : "bg-white/5"}
                hover:bg-white/20`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                ${selectedAnswers.includes(index) ? "border-white" : "border-blue-200"}`}
              >
                {selectedAnswers.includes(index) && (
                  <div className="w-3 h-3 rounded-full bg-white" />
                )}
              </div>
              <span className="text-lg">{answer}</span>
            </button>
          ))}
        </div>
        <Button
          onClick={handleNext}
          className="w-full mt-6 bg-white hover:bg-blue-50 text-blue-600 transition-colors"
          disabled={selectedAnswers.length === 0}
        >
          {currentQuestionIndex === QUIZ_QUESTIONS.length - 1 ? "Finish Quiz" : "Next Question"}
        </Button>
      </CardContent>
    </Card>
  )
}