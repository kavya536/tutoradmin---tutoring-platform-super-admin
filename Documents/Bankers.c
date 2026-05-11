// Bankers's Algorithm
#include <stdio.h>
int main.()
{
//p0,p1,p2,p3,p4 are the process names here
int n,m,i,j,k;
n=5;// number of processes
m=3;// number of resources 
int alloc[5][3]={{0,1,0},// p0 // allocation matrix
{2,0,0},//p1
{3,0,2},//p2
{2,1,1},//p3
{0,0,2}};//p4
int max[5][3]={{7,5,3},// max matrix
{3,2,2},//p1
{9,0,2},//p2
{2,2,2},//p3
{4,3,3};//p4
int avail[3]={3,3,2};//Available Resources
iny f[n], ans[n],ind=0;
for (k=0;k<n;k++){
for (j=0;j<n;j++)
need[i][j]=max[i][j]-alloc[i][j];
}
int y=0;
for(k=o;k<5;k++){
for(i=0;i<n,i++){
if (f[i]==0;j<m,j++){
if (need[i][j]>avail[j]){
flag=1;
break;
if flag==0){
ans[ind++]=i;
for(y=0;y<m;y++)
avail[y]+=alloc[i][y];
f[i]=1;
}}}}
int flag=1;
for(i=o;i<n;i++){
if(f[i]==0)
{
flag=0;
printf("the following system is not safe");
break;
}}
if (flag==1)
{
printf("following is the safe sequence/n");
for(i=0;i<n;i++)
printf("p%d->",ans[i]);
printf("p%d",ans[n-1]);
}
return(0)
//this code is contributed by deep baldha
(candyzack)
}

